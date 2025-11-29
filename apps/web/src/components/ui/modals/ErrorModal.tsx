"use client";

import { AlertCircle } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { DialogDescription, DialogTitle } from "../dialog";
import { Button } from "../button";

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  onRetry?: () => void;
}

export function ErrorModal({
  open,
  onClose,
  message = "오류가 발생했습니다. 다시 시도해주세요.",
  onRetry,
}: ErrorModalProps) {
  return (
    <BaseModal open={open} onClose={onClose}>
      <DialogTitle className="sr-only">오류</DialogTitle>
      <div className="flex flex-col items-center justify-center py-6">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: "#FEF2F2" }}
        >
          <AlertCircle className="w-8 h-8" style={{ color: "#DC2626" }} />
        </div>
        <DialogDescription
          style={{
            color: "#333333",
            fontSize: "0.95rem",
            textAlign: "center",
            marginBottom: "1.5rem",
            whiteSpace: "pre-line",
          }}
        >
          {message}
        </DialogDescription>
        <div className="flex gap-3 w-full">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="flex-1"
              style={{
                backgroundColor: "#6B7A6F",
                color: "white",
                fontWeight: "600",
              }}
            >
              다시 시도
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="outline"
            className={onRetry ? "flex-1" : "w-full"}
            style={{
              color: "#4E4B46",
              borderColor: "#E5E7EB",
              backgroundColor: "white",
              fontWeight: "500",
            }}
          >
            확인
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
