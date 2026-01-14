import { InquiryList } from "../../components/InquiryList";

export default function AdminInquiriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "#2b2b2b" }}
        >
          문의사항 관리
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "#7a7a7a" }}
        >
          사용자 문의사항을 확인하고 관리하세요.
        </p>
      </div>
      <InquiryList />
    </div>
  );
}
