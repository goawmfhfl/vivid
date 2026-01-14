"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md max-h-[85vh] overflow-y-auto [&>button]:h-6 [&>button]:w-6 [&>button]:p-0.5 [&>button]:top-2.5 [&>button]:right-2.5 [&>button>svg]:h-3.5 [&>button>svg]:w-3.5"
        style={{
          width: "calc(100vw - 2rem)",
          maxWidth: "28rem",
          padding: "1.25rem",
        }}
      >
        <DialogHeader className="pb-3 pr-8">
          <DialogTitle className="text-base sm:text-lg pr-2">
            이용약관 및 개인정보 수집·이용 동의
          </DialogTitle>
        </DialogHeader>
        <DialogDescription
          className="space-y-4 pt-2"
          style={{ color: "#333333", lineHeight: "1.7" }}
        >
          <div>
            <h3 className="mb-2 font-semibold" style={{ fontSize: "0.9rem" }}>
              제1조 (목적)
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#4E4B46" }}>
              본 약관은 vivid(이하 &quot;서비스&quot;)가 제공하는 기록 및 AI
              피드백 기능을 이용함에 있어, 이용자와 서비스 운영자 간의
              권리·의무를 규정함을 목적으로 합니다.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold" style={{ fontSize: "0.9rem" }}>
              제2조 (수집하는 개인정보 항목)
            </h3>
            <div style={{ fontSize: "0.8rem", color: "#4E4B46" }}>
              <p>
                서비스는 회원가입 및 기록 피드백 제공을 위해 아래 정보를
                수집합니다.
              </p>
              {/* 모바일용 간단한 카드 레이아웃 */}
              <div className="block md:hidden mt-4 space-y-2">
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      필수
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="mb-1">
                      <span className="font-medium">수집 항목:</span> 이메일,
                      비밀번호, 닉네임, 전화번호
                    </div>
                    <div>
                      <span className="font-medium">수집 목적:</span> 회원 식별,
                      로그인, 계정 관리, 계정 복구
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      선택
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="mb-1">
                      <span className="font-medium">수집 항목:</span> 생년, 성별
                    </div>
                    <div>
                      <span className="font-medium">수집 목적:</span> 개인화
                      피드백 제공
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      자동 수집
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="mb-1">
                      <span className="font-medium">수집 항목:</span> 접속기기
                      정보, 이용 로그, 쿠키
                    </div>
                    <div>
                      <span className="font-medium">수집 목적:</span> 서비스
                      안정성 및 품질 개선
                    </div>
                  </div>
                </div>
              </div>
              {/* 태블릿/데스크탑용 깔끔한 테이블 레이아웃 */}
              <div className="hidden md:block mt-4">
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                          구분
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                          수집 항목
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                          수집 목적
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">
                          필수
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          이메일, 비밀번호, 닉네임, 전화번호
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          회원 식별, 로그인, 계정 관리, 계정 복구
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">
                          선택
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          생년, 성별
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          개인화 피드백 제공
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">
                          수집
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          접속기기 정보, 이용 로그, 쿠키
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          서비스 안정성 및 품질 개선
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold" style={{ fontSize: "0.9rem" }}>
              제3조 (개인정보의 이용 목적)
            </h3>
            <div style={{ fontSize: "0.8rem", color: "#4E4B46" }}>
              <p>수집된 개인정보는 아래 목적으로 이용됩니다.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>회원 식별 및 서비스 제공</li>
                <li>기록 데이터 저장 및 피드백 분석</li>
                <li>서비스 개선 및 신규 기능 개발</li>
                <li>고객 문의 대응 및 공지사항 전달</li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold" style={{ fontSize: "0.9rem" }}>
              제4조 (보관 및 파기)
            </h3>
            <div style={{ fontSize: "0.8rem", color: "#4E4B46" }}>
              <ul className="list-disc pl-5 space-y-1">
                <li>회원 탈퇴 시 모든 개인정보는 즉시 삭제됩니다.</li>
                <li>
                  법령상 보존이 필요한 경우 관련 법령에 따라 일정 기간 보관 후
                  파기합니다.
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold" style={{ fontSize: "0.9rem" }}>
              제5조 (이용자의 권리)
            </h3>
            <div style={{ fontSize: "0.8rem", color: "#4E4B46" }}>
              <p>
                이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제를 요청할 수
                있으며, 문의 메일을 통해 요청할 수 있습니다.
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold" style={{ fontSize: "0.9rem" }}>
              제6조 (AI 데이터 처리 및 보안)
            </h3>
            <div style={{ fontSize: "0.8rem", color: "#4E4B46" }}>
              <p>
                서비스는 기록 데이터 분석 및 VIVID 생성을 위해 AI 모델과
                연동되며, 이 과정에서 입력된 문장이 암호화되어 저장·처리됩니다.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>AI 학습용 2차 활용은 하지 않습니다.</li>
                <li>
                  암호화 키는 별도 환경 변수로 관리되며, 운영자 외 접근이
                  제한됩니다.
                </li>
                <li>
                  시스템 이상 탐지, 백업 및 로그 확인을 위해 최소한의 정보가
                  처리될 수 있습니다.
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold" style={{ fontSize: "0.9rem" }}>
              제7조 (서비스 이용 제한 및 책임)
            </h3>
            <div style={{ fontSize: "0.8rem", color: "#4E4B46" }}>
              <p>
                이용자는 타인의 권리를 침해하는 내용, 허위 정보, 불법 복제물
                등을 기록에 포함할 수 없으며, 이를 위반할 경우 서비스 이용이
                제한될 수 있습니다.
              </p>
              <p>
                서비스는 AI 기반 분석 특성상 100% 정확성을 보장하지 않으며,
                제공된 피드백은 개인적인 참고용으로 활용해야 합니다.
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold" style={{ fontSize: "0.9rem" }}>
              제8조 (약관 변경 및 통지)
            </h3>
            <div style={{ fontSize: "0.8rem", color: "#4E4B46" }}>
              <p>
                약관이 변경되는 경우 서비스 공지 또는 이메일을 통해 사전
                안내합니다. 변경된 약관 공지 이후에도 서비스를 계속 이용하는
                경우, 변경 사항에 동의한 것으로 간주됩니다.
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold" style={{ fontSize: "0.9rem" }}>
              제9조 (문의처)
            </h3>
            <div style={{ fontSize: "0.8rem", color: "#4E4B46" }}>
              <p>
                서비스 이용 중 궁금한 사항이나 개인정보 관련 요청은
                try.grit.official@gmail.com 로 문의해 주세요. 빠르게 검토 후
                답변드리겠습니다.
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold" style={{ fontSize: "0.9rem" }}>
              제10조 (마케팅 정보 수신 동의 [선택])
            </h3>
            <div style={{ fontSize: "0.8rem", color: "#4E4B46" }}>
              <p>
                이용자는 문자·이메일 등으로 제공되는 서비스 소식, 이용 팁,
                이벤트 안내 등을 위한 마케팅 정보 수신에 선택적으로 동의할 수
                있습니다.
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>동의하지 않아도 서비스 기본 이용에는 제한이 없습니다.</li>
                <li>
                  동의 후에도 언제든지 계정 설정 또는 문의를 통해 철회할 수
                  있습니다.
                </li>
                <li>
                  수신 동의 여부는 사용자 메타데이터에 암호화되어 저장됩니다.
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold" style={{ fontSize: "0.9rem" }}>
              제11조 (기타)
            </h3>
            <div style={{ fontSize: "0.8rem", color: "#4E4B46" }}>
              <p>
                기타 개인정보 처리에 관한 세부 내용은 별도의 「개인정보
                처리방침」에 따르며, 본 약관과 상충하는 경우 개인정보 처리방침이
                우선 적용됩니다.
              </p>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
