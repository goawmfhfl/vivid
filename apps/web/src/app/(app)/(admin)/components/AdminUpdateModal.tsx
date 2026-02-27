"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminApiFetch } from "@/lib/admin-api-client";
import { COLORS } from "@/lib/design-system";

type Modal = {
  id: string;
  title: string;
  image_url: string;
  destination_path: string;
};

export function AdminUpdateModal() {
  const router = useRouter();
  const [modal, setModal] = useState<Modal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await adminApiFetch("/api/admin/update-modals/active");
        const data = await res.json();
        setModal(data.modal ?? null);
      } catch {
        setModal(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActive();
  }, []);

  const handleConfirm = () => {
    if (!modal) return;
    setModal(null);
    router.push(modal.destination_path);
  };

  const handleDismiss = async () => {
    if (!modal) return;
    setIsDismissing(true);
    try {
      await adminApiFetch(`/api/admin/update-modals/${modal.id}/dismiss`, {
        method: "POST",
      });
      setModal(null);
    } finally {
      setIsDismissing(false);
    }
  };

  if (isLoading || !modal) return null;

  return (
    <Dialog open={!!modal} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-[365px] w-[calc(100vw-2rem)] p-0 overflow-hidden gap-0"
        style={{ width: 365 }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="p-4 space-y-4">
          <DialogTitle
            className="text-base font-semibold text-center"
            style={{ color: COLORS.text.primary }}
          >
            {modal.title}
          </DialogTitle>
          <div
            className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100"
            style={{ maxWidth: 365, maxHeight: 365 }}
          >
            <img
              src={modal.image_url}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl font-medium"
              style={{
                backgroundColor: COLORS.brand.primary,
                color: COLORS.text.white,
              }}
            >
              확인하기
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              disabled={isDismissing}
              className="w-full py-2.5 rounded-xl text-sm"
              style={{
                backgroundColor: "transparent",
                color: COLORS.text.tertiary,
              }}
            >
              {isDismissing ? "처리 중..." : "다시 보지 않기"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
