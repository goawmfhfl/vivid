"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent } from "../dialog";

// 기본 모달 컴포넌트 (공통 구조)
interface BaseModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  closable?: boolean;
  maxWidth?: string;
}

export function BaseModal({
  open,
  onClose,
  children,
  closable = true,
  maxWidth = "sm:max-w-md",
}: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={closable ? onClose : undefined}>
      <DialogContent
        style={{ backgroundColor: "#FAFAF8" }}
        className={maxWidth}
        onInteractOutside={
          closable ? undefined : (e: Event) => e.preventDefault()
        }
        onEscapeKeyDown={
          closable ? undefined : (e: KeyboardEvent) => e.preventDefault()
        }
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
