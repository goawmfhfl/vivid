import { RecordingGuideContent } from "@/components/guide/RecordingGuideContent";

import vivid_1 from "@/assets/guide/vivid_1.png";
import vivid_2 from "@/assets/guide/vivid_2.png";
import vivid_3 from "@/assets/guide/vivid_3.png";
import vivid_4 from "@/assets/guide/vivid_4.png";
import vivid_5 from "@/assets/guide/vivid_5.png";

export const dynamic = "force-static";

/**
 * VIVID 기록 가이드 페이지
 * - SSG: 정적 import로 빌드 시점에 이미지 번들링
 * - 스크롤 시 순차 노출 + 레이지 로딩 (RecordingGuideContent)
 */
export default function RecordingGuidePage() {
  return (
    <RecordingGuideContent
      images={[vivid_1, vivid_2, vivid_3, vivid_4, vivid_5]}
    />
  );
}
