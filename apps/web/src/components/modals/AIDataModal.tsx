"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

interface AIDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIDataModal({ isOpen, onClose }: AIDataModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI 피드백 데이터 학습 활용 동의</DialogTitle>
        </DialogHeader>
        <DialogDescription
          className="space-y-4"
          style={{ color: "#333333", lineHeight: "1.7" }}
        >
          <div>
            <h3 className="mb-2" style={{ fontSize: "0.95rem" }}>
              제1조 (수집 및 활용 목적)
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#4E4B46" }}>
              서비스는 이용자의 기록 데이터를 바탕으로 AI VIVID를 제공합니다.
              AI 품질 향상을 위해 일부 데이터는 익명화 처리 후 학습 데이터로
              활용될 수 있으며, 전체 서비스 인프라는 데이터 무결성과 가용성을
              확보한 보안 체계 위에서 운영됩니다.
            </p>
          </div>
          <div>
            <h3 className="mb-2" style={{ fontSize: "0.95rem" }}>
              제2조 (수집 및 처리 범위)
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#4E4B46" }}>
              사용자가 작성한 기록의 본문 내용
              <br /> 피드백 결과 및 사용자 만족도 점수
              <br /> 비식별화된 메타데이터(날짜, 키워드 등)
              <br /> 서비스 전반의 운영 로그(보안 이상 징후 탐지를 위한 암호화된
              항목)
            </p>
          </div>
          <div>
            <h3 className="mb-2" style={{ fontSize: "0.95rem" }}>
              제3조 (익명화·암호화 처리 방식)
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#4E4B46" }}>
              개인을 식별할 수 있는 정보(이메일, 이름 등)는 학습 전에 완전
              제거됩니다.
              <br /> AI 관련 데이터는 저장·전송 단계에서 최신 표준에 따른
              암호화(예: AES-256, TLS 1.3 등)를 적용해 보호합니다.
              <br /> 학습 데이터는 통계적 분석 및 모델 개선 용도로만 사용되며
              외부에 공개되지 않습니다.
            </p>
          </div>
          <div>
            <h3 className="mb-2" style={{ fontSize: "0.95rem" }}>
              제4조 (보관 기간 및 안전성)
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#4E4B46" }}>
              회원 탈퇴 시 학습용 데이터는 즉시 삭제되며, 이미 학습된 모델에
              반영된 데이터는 개별 삭제가 불가능합니다. 서비스는 정기적 보안
              점검과 접근 통제 정책을 유지해 데이터가 안전하게 관리되도록
              합니다.
            </p>
          </div>
          <div>
            <h3 className="mb-2" style={{ fontSize: "0.95rem" }}>
              제5조 (문의처)
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#4E4B46" }}>
              AI 데이터 처리 관련 문의는 아래로 연락 가능합니다.
              <br /> ✉️ goawmfhfl1@naver.com
              <br /> 담당자: 개인정보보호 책임자 최재영
            </p>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
