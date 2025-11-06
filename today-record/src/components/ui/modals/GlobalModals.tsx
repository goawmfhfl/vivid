"use client";

import { LoadingModal } from "./LoadingModal";
import { ErrorModal } from "./ErrorModal";
import { useModalStore } from "@/store/useModalStore";

/**
 * 전역 모달 컴포넌트
 * 앱의 루트 레이아웃에 추가하여 어디서든 모달을 사용할 수 있도록 함
 */
export function GlobalModals() {
  const loadingModal = useModalStore((state) => state.loadingModal);
  const closeLoadingModal = useModalStore((state) => state.closeLoadingModal);

  const errorModal = useModalStore((state) => state.errorModal);
  const closeErrorModal = useModalStore((state) => state.closeErrorModal);
  const errorRetryHandler = useModalStore(
    (state) => state.errorModal.retryHandler
  );

  return (
    <>
      <LoadingModal
        open={loadingModal.isOpen}
        message={loadingModal.message}
        closable={loadingModal.isManual}
        onClose={closeLoadingModal}
      />
      <ErrorModal
        open={errorModal.isOpen}
        onClose={closeErrorModal}
        message={errorModal.message || undefined}
        onRetry={errorRetryHandler}
      />
    </>
  );
}
