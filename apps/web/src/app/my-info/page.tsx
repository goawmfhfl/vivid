import { MyInfoView } from "@/components/my-info/MyInfoView";
import { AppHeader } from "@/components/common/AppHeader";
import { SPACING } from "@/lib/design-system";

export default function MyInfoPage() {
  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <AppHeader title="내정보" />
      <MyInfoView />
    </div>
  );
}
