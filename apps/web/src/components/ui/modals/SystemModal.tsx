"use client";

import { ReactNode } from "react";
import { BaseModal } from "./BaseModal";
import { DialogDescription, DialogHeader, DialogTitle } from "../dialog";
import { Button } from "../button";

export interface SystemModalButton {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive";
  style?: React.CSSProperties;
  show?: boolean;
}

interface SystemModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttons?: SystemModalButton[];
  showYesNo?: boolean;
  onYes?: () => void;
  onNo?: () => void;
  yesLabel?: string;
  noLabel?: string;
  icon?: ReactNode;
  closable?: boolean;
}

export function SystemModal({
  open,
  onClose,
  title,
  message,
  buttons = [],
  showYesNo = false,
  onYes,
  onNo,
  yesLabel = "예",
  noLabel = "아니오",
  icon,
  closable = true,
}: SystemModalProps) {
  const handleYes = () => {
    if (onYes) {
      onYes();
    }
    onClose();
  };

  const handleNo = () => {
    if (onNo) {
      onNo();
    }
    onClose();
  };

  const visibleButtons = buttons.filter((btn) => btn.show !== false);

  return (
    <BaseModal open={open} onClose={onClose} closable={closable}>
      {title ? (
        <DialogHeader>
          <DialogTitle
            style={{
              color: "#333333",
              fontSize: "1.1rem",
              fontWeight: "600",
              textAlign: "center",
              marginBottom: "0.5rem",
            }}
          >
            {title}
          </DialogTitle>
        </DialogHeader>
      ) : (
        <DialogTitle className="sr-only">알림</DialogTitle>
      )}
      <div className="flex flex-col items-center justify-center py-6">
        {icon && <div className="mb-4">{icon}</div>}

        <DialogDescription
          style={{
            color: "#333333",
            fontSize: "0.95rem",
            textAlign: "center",
            marginBottom: "1.5rem",
            lineHeight: "1.6",
          }}
        >
          {message}
        </DialogDescription>

        <div className="flex gap-3 w-full">
          {showYesNo && (
            <>
              <Button
                onClick={handleYes}
                className="flex-1"
                style={{
                  backgroundColor: "#6B7A6F",
                  color: "white",
                  fontWeight: "600",
                }}
              >
                {yesLabel}
              </Button>
              <Button
                onClick={handleNo}
                variant="outline"
                className="flex-1"
                style={{
                  color: "#4E4B46",
                  borderColor: "#E5E7EB",
                  backgroundColor: "white",
                  fontWeight: "500",
                }}
              >
                {noLabel}
              </Button>
            </>
          )}

          {visibleButtons.map((button, index) => (
            <Button
              key={index}
              onClick={() => {
                button.onClick();
                onClose();
              }}
              variant={button.variant || "default"}
              className="flex-1"
              style={
                button.style || {
                  backgroundColor: "#6B7A6F",
                  color: "white",
                  fontWeight: "600",
                }
              }
            >
              {button.label}
            </Button>
          ))}

          {!showYesNo && visibleButtons.length === 0 && (
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
              style={{
                color: "#4E4B46",
                borderColor: "#E5E7EB",
                backgroundColor: "white",
                fontWeight: "500",
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
