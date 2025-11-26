"use client";

import { CheckCircle2 } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { DialogDescription, DialogTitle } from "../dialog";
import { Button } from "../button";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  onConfirm?: () => void;
}

export function SuccessModal({
  open,
  onClose,
  message = "처리가 완료되었습니다.",
  onConfirm,
}: SuccessModalProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <BaseModal open={open} onClose={onClose}>
      <DialogTitle className="sr-only">성공</DialogTitle>
      <div className="flex flex-col items-center justify-center py-6">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: "#F0FDF4" }}
        >
          <CheckCircle2 className="w-8 h-8" style={{ color: "#10B981" }} />
        </div>
        <DialogDescription
          className={`${TYPOGRAPHY.body.fontSize} text-center mb-6`}
          style={{
            color: COLORS.text.primary,
            whiteSpace: "pre-line",
          }}
        >
          {message}
        </DialogDescription>
        <div className="flex gap-3 w-full">
          {onConfirm && (
            <Button
              onClick={handleConfirm}
              className="flex-1"
              style={{
                backgroundColor: COLORS.brand.primary,
                color: COLORS.text.white,
                fontWeight: "600",
              }}
            >
              확인
            </Button>
          )}
          {!onConfirm && (
            <Button
              onClick={onClose}
              className="w-full"
              style={{
                backgroundColor: COLORS.brand.primary,
                color: COLORS.text.white,
                fontWeight: "600",
              }}
            >
              확인
            </Button>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
