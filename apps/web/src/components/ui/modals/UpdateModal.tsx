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
import { COLORS } from "@/lib/design-system";

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
        className="max-w-[365px] w-[calc(100vw-2rem)] p-0 overflow-hidden gap-0"
        style={{ width: 365 }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{modal.title}</DialogTitle>
        <DialogClose asChild>
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full hover:bg-black/5 transition-colors"
            style={{ color: COLORS.text.tertiary }}
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogClose>
        <div className="flex flex-col items-center pt-2 pb-3 px-4">
          <div
            className="relative w-full aspect-square rounded-xl overflow-hidden flex-1 flex min-h-0"
            style={{ maxWidth: 340, maxHeight: 340 }}
          >
            <img
              src={modal.image_url}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex gap-2 w-full mt-2" style={{ maxWidth: 340 }}>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 rounded-lg text-xs"
              style={{
                backgroundColor: "transparent",
                color: COLORS.text.tertiary,
              }}
            >
              더이상 보지 않기
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: COLORS.brand.primary,
                color: COLORS.text.white,
              }}
            >
              확인하기
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
