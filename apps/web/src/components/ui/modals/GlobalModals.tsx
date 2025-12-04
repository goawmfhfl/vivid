"use client";

import { LoadingModal } from "./LoadingModal";
import { ErrorModal } from "./ErrorModal";
import { SuccessModal } from "./SuccessModal";
import { AICostModal } from "./AICostModal";
import { useModalStore } from "@/store/useModalStore";
import { useEnvironment } from "@/hooks/useEnvironment";

/**
 * 전역 모달 컴포넌트
 * 앱의 루트 레이아웃에 추가하여 어디서든 모달을 사용할 수 있도록 함
 */
export function GlobalModals() {
  const { isDevelopment } = useEnvironment();

  const loadingModal = useModalStore((state) => state.loadingModal);
  const closeLoadingModal = useModalStore((state) => state.closeLoadingModal);

  const errorModal = useModalStore((state) => state.errorModal);
  const closeErrorModal = useModalStore((state) => state.closeErrorModal);
  const errorRetryHandler = useModalStore(
    (state) => state.errorModal.retryHandler
  );

  const successModal = useModalStore((state) => state.successModal);
  const closeSuccessModal = useModalStore((state) => state.closeSuccessModal);
  const successConfirmHandler = useModalStore(
    (state) => state.successModal.onConfirm
  );

  return (
    <>
      <LoadingModal
        open={loadingModal.isOpen}
        message={loadingModal.message}
        closable={loadingModal.isManual}
        onClose={closeLoadingModal}
        progress={loadingModal.progress}
      />
      <ErrorModal
        open={errorModal.isOpen}
        onClose={closeErrorModal}
        message={errorModal.message || undefined}
        onRetry={errorRetryHandler}
      />
      <SuccessModal
        open={successModal.isOpen}
        onClose={closeSuccessModal}
        message={successModal.message || undefined}
        onConfirm={successConfirmHandler}
      />
      {isDevelopment && <AICostModal />}
    </>
  );
}
