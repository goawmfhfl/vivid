"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { DailyVividView } from "@/components/dailyVivid/DailyVividView";

export default function DailyViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  const handleBack = () => {
    router.push("/");
  };

  return <DailyVividView id={resolvedParams.id} onBack={handleBack} />;
}
