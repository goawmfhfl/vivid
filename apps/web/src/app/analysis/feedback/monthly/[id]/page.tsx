"use client";

import { MonthlyVividView } from "@/components/monthlyVivid/MonthlyVividView";
import { useRouter, useParams } from "next/navigation";

export default function MonthlyViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const handleBack = () => {
    router.push("/reports/monthly");
  };

  return <MonthlyVividView id={id} onBack={handleBack} />;
}
