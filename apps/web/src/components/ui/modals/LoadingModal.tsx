"use client";

import { BaseModal } from "./BaseModal";
import { DialogTitle } from "../dialog";
import { LoadingSpinner } from "../LoadingSpinner";

interface LoadingModalProps {
  open: boolean;
  message?: string;
  closable?: boolean;
  onClose?: () => void;
}

export function LoadingModal({
  open,
  message = "처리 중입니다...",
  closable = false,
  onClose,
}: LoadingModalProps) {
  return (
    <BaseModal open={open} closable={closable} onClose={onClose}>
      <DialogTitle className="sr-only">로딩 중</DialogTitle>
      <div className="py-8">
        <LoadingSpinner message={message} size="md" showMessage={true} />
      </div>
    </BaseModal>
  );
}
