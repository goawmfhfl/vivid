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
  SPACING,
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
export function UpdateModal() {
  const router = useRouter();
  const pathname = usePathname();
  const [modal, setModal] = useState<Modal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isConsumerPage = pathname && !pathname.startsWith("/admin");

  useEffect(() => {
    if (!isConsumerPage) {
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
  }, [isConsumerPage]);

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
          "max-w-[380px] w-[calc(100vw-2rem)] p-0 overflow-hidden gap-0 border-0",
          TRANSITIONS.default
        )}
        style={{
          width: 380,
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
            className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
            style={{
              maxWidth: 380,
              backgroundColor: COLORS.background.card,
            }}
          >
            <img
              src={modal.image_url}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
          {/* 액션 영역 */}
          <div
            className={cn("flex gap-3 w-full", SPACING.card.padding)}
            style={{
              paddingTop: 16,
              paddingBottom: 20,
              borderTop: `1px solid ${COLORS.border.light}`,
              backgroundColor: COLORS.surface.elevated,
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                "flex-1 rounded-xl text-sm font-medium",
                BUTTON_STYLES.ghost.padding,
                TRANSITIONS.colors
              )}
              style={{
                color: COLORS.text.secondary,
                border: `1.5px solid ${COLORS.border.light}`,
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.background.hover;
                e.currentTarget.style.borderColor = COLORS.border.default;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = COLORS.border.light;
              }}
            >
              <span className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.fontWeight)}>
                더이상 보지 않기
              </span>
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={cn(
                "flex-1 rounded-xl font-medium",
                BUTTON_STYLES.primary.padding,
                BUTTON_STYLES.primary.borderRadius,
                TRANSITIONS.colors
              )}
              style={{
                backgroundColor: COLORS.brand.primary,
                color: COLORS.text.white,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.brand.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.brand.primary;
              }}
            >
              <span className={cn(TYPOGRAPHY.body.fontSize, "font-semibold")}>
                확인하기
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
