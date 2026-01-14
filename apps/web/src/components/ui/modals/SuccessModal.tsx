"use client";

import { Sparkles } from "lucide-react";
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
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center relative"
          style={{
            background: `linear-gradient(135deg, ${COLORS.brand.primary}15 0%, ${COLORS.brand.light}15 100%)`,
            border: `2px solid ${COLORS.brand.primary}30`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${COLORS.brand.primary}20 0%, transparent 70%)`,
            }}
          />
          <Sparkles
            className="w-10 h-10 relative z-10"
            style={{
              color: COLORS.brand.primary,
              filter: `drop-shadow(0 2px 8px ${COLORS.brand.primary}40)`,
            }}
          />
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
