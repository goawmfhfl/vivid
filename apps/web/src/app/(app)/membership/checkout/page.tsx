"use client";

/**
 * 결제 화면으로의 전환용 라우트.
 * 앱 WebView에서 이 URL로 이동하면 모바일 앱이 감지하여 네이티브 결제 화면을 표시합니다.
 * 웹에서 직접 접근한 경우에만 이 페이지가 보입니다.
 */
export default function MembershipCheckoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#FAFAF8]">
      <p className="text-gray-500 text-center">
        앱에서 결제를 진행해주세요.
      </p>
    </div>
  );
}
