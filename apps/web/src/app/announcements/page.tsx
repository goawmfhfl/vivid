"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, ChevronRight } from "lucide-react";
import { withAuth } from "@/components/auth";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/lib/design-system";
import { AppHeader } from "@/components/common/AppHeader";
import { cn } from "@/lib/utils";

type Announcement = {
  id: string;
  title: string;
  description: string | null;
  display_from: string;
  display_until: string | null;
  sort_order: number;
  created_at: string;
  thumbnail_path: string | null;
  thumbnail_url: string | null;
};

function AnnouncementsPageInner() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      try {
        const res = await fetch("/api/announcements", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setAnnouncements(data.announcements ?? []);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 pb-24" style={{ backgroundColor: COLORS.background.card }}>
      <div className="max-w-2xl mx-auto">
        <AppHeader
          title="공지사항"
          titleIcon={Megaphone}
          showBackButton
          onBack={() => router.back()}
        />
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div
              className="animate-spin rounded-full h-10 w-10 border-b-2"
              style={{ borderColor: COLORS.brand.primary }}
            />
          </div>
        ) : announcements.length === 0 ? (
          <p className="py-12 text-center" style={{ color: COLORS.text.tertiary }}>
            등록된 공지가 없습니다.
          </p>
        ) : (
          <div className="space-y-4 mt-6">
            {announcements.map((a) => {
              const dateStr = a.display_from
                ? new Date(a.display_from).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).replace(/\. /g, ".").replace(/\.$/, "")
                : "";
              return (
                <button
                  key={a.id}
                  onClick={() => router.push(`/announcements/${a.id}`)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors",
                    "hover:opacity-90"
                  )}
                  style={{
                    backgroundColor: COLORS.background.card,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: COLORS.brand.light + "30" }}
                  >
                    <Megaphone className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate" style={{ color: COLORS.text.primary }}>
                      {a.title}
                    </h3>
                    {dateStr && (
                      <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
                        {dateStr}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.text.tertiary }} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(AnnouncementsPageInner);
