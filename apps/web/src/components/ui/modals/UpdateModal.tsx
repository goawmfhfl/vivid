"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  COLORS,
  TYPOGRAPHY,
  BUTTON_STYLES,
  CARD_STYLES,
  SHADOWS,
  TRANSITIONS,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";

const PERMANENTLY_DISMISSED_KEY = "vivid_update_modal_permanent_v1";

type Modal = {
  id: string;
  title: string;
  image_url: string;
  destination_path: string;
};

interface UpdateModalProps {
  deferred?: boolean;
}

/** 영구 숨김 여부 확인 */
function isPermanentlyDismissed(modalId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(PERMANENTLY_DISMISSED_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) && ids.includes(modalId);
  } catch {
    return false;
  }
}

/** 영구 숨김 저장 (확인하기 / X / 더이상 보지 않기) */
function addPermanentDismiss(modalId: string) {
  try {
    const raw = localStorage.getItem(PERMANENTLY_DISMISSED_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    if (!ids.includes(modalId)) {
      ids.push(modalId);
      localStorage.setItem(PERMANENTLY_DISMISSED_KEY, JSON.stringify(ids));
    }
  } catch {
    // ignore
  }
}

/**
 * 업데이트 모달 - 소비자 페이지(/admin 제외)에서만 노출
 */
export function UpdateModal({ deferred = false }: UpdateModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [modal, setModal] = useState<Modal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isConsumerPage = pathname && !pathname.startsWith("/admin");

  useEffect(() => {
    if (!isConsumerPage || deferred) {
      setIsLoading(false);
      setModal(null);
      return;
    }

    let cancelled = false;
    const fetchActive = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }
        const res = await fetch("/api/update-modals/active", {
          headers,
          credentials: "include",
        });
        if (cancelled) return;
        const data = await res.json();
        const m = data.modal ?? null;
        if (!m || isPermanentlyDismissed(m.id)) {
          setModal(null);
        } else {
          setModal(m);
        }
      } catch {
        if (!cancelled) setModal(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchActive();
    return () => {
      cancelled = true;
    };
  }, [deferred, isConsumerPage]);

  const handleConfirm = () => {
    if (!modal) return;
    const dest = modal.destination_path;
    addPermanentDismiss(modal.id);
    setModal(null);
    router.push(dest);
  };

  const handleClose = () => {
    if (!modal) return;
    addPermanentDismiss(modal.id);
    setModal(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  // 소비자 페이지가 아니면 렌더하지 않음
  if (!isConsumerPage) return null;

  // 로딩 중이거나 모달 데이터 없으면 렌더하지 않음
  if (isLoading || !modal) return null;

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent
        hideOverlay
        className={cn(
          "max-w-[300px] sm:max-w-[320px] w-[calc(100vw-1.25rem)] p-0 overflow-hidden gap-0 border-0",
          TRANSITIONS.default
        )}
        style={{
          borderRadius: CARD_STYLES.default.borderRadius,
          boxShadow: SHADOWS.elevation5,
          backgroundColor: COLORS.surface.elevated,
          border: CARD_STYLES.default.border,
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{modal.title}</DialogTitle>
      
        <div className="flex flex-col overflow-hidden">
          {/* 이미지 영역 */}
          <div
            className="relative w-full flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: COLORS.background.card,
            }}
          >
            <img
              src={modal.image_url}
              alt=""
              className="block w-full h-auto object-contain"
              style={{
                maxHeight: "58vh",
              }}
              loading="eager"
              decoding="async"
            />
          </div>
          {/* 액션 영역 */}
          <div
            className={cn("flex gap-1 w-full px-1.5 sm:px-2")}
            style={{
              paddingTop: 5,
              paddingBottom: 5,
              borderTop: `1px solid ${COLORS.border.light}`,
              backgroundColor: COLORS.surface.elevated,
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                TRANSITIONS.colors,
                BUTTON_STYLES.mini.borderRadius,
                BUTTON_STYLES.mini.padding,
                BUTTON_STYLES.mini.fontSize,
                BUTTON_STYLES.mini.lineHeight,
                "flex-1 min-w-0 font-medium overflow-hidden"
              )}
              style={{
                color: COLORS.text.secondary,
                border: `1.5px solid ${COLORS.border.default}`,
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.background.hover;
                e.currentTarget.style.borderColor = COLORS.border.default;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = COLORS.border.default;
              }}
            >
              <span
                className={cn(
                  TYPOGRAPHY.body.fontWeight,
                  "block w-full text-center whitespace-nowrap truncate"
                )}
              >
                더이상 보지 않기
              </span>
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={cn(
                TRANSITIONS.colors,
                BUTTON_STYLES.mini.borderRadius,
                BUTTON_STYLES.mini.padding,
                BUTTON_STYLES.mini.fontSize,
                BUTTON_STYLES.mini.lineHeight,
                "flex-1 min-w-0 font-medium overflow-hidden"
              )}
              style={{
                backgroundColor: COLORS.brand.primary,
                color: COLORS.text.white,
                border: `1.5px solid ${COLORS.border.default}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.brand.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.brand.primary;
              }}
            >
              <span className="block w-full text-center whitespace-nowrap truncate font-semibold">
                확인하기
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
