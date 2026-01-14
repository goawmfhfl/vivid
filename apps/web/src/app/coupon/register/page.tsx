import { CouponRegisterView } from "@/components/coupon/CouponRegisterView";
import { AppHeader } from "@/components/common/AppHeader";
import { SPACING } from "@/lib/design-system";

export default function CouponRegisterPage() {
  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <AppHeader title="쿠폰 등록" showBackButton={true} />
      <CouponRegisterView />
    </div>
  );
}
