"use client";

import { useState } from "react";
import {
  COLORS,
  TYPOGRAPHY,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { Users, MessageSquare, ThumbsUp, UserX } from "lucide-react";
import { UserList } from "@/app/(app)/(admin)/components/UserList";
import { InquiryList } from "@/app/(app)/(admin)/components/InquiryList";
import { UserFeedbackList } from "@/app/(app)/(admin)/components/UserFeedbackList";
import { AccountDeletionsPage } from "@/app/(app)/(admin)/components/AccountDeletionsPage";
import { SurveyResultsView } from "@/app/(app)/(admin)/components/SurveyResultsView";
import { ClipboardList } from "lucide-react";

type UsersTab = "user-list" | "inquiries" | "feedbacks" | "account-deletions" | "survey-results";

export default function UserListPage() {
  const [activeTab, setActiveTab] = useState<UsersTab>("user-list");

  const tabs: { id: UsersTab; label: string; icon: typeof Users }[] = [
    { id: "user-list", label: "유저 목록", icon: Users },
    { id: "inquiries", label: "문의사항", icon: MessageSquare },
    { id: "feedbacks", label: "피드백", icon: ThumbsUp },
    { id: "survey-results", label: "설문 결과", icon: ClipboardList },
    { id: "account-deletions", label: "탈퇴 사유 관리", icon: UserX },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h1
          className={cn(
            TYPOGRAPHY.h2.fontSize,
            TYPOGRAPHY.h2.fontWeight,
            TYPOGRAPHY.h2.lineHeight
          )}
          style={{ color: TYPOGRAPHY.h2.color }}
        >
          유저 관리
        </h1>
        <p className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}>
          유저 목록, 문의사항, 피드백, 설문 결과, 탈퇴 사유를 확인하고 관리하세요.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div
        className="flex flex-wrap gap-2 pb-4 border-b"
        style={{ borderColor: COLORS.border.light }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                activeTab === tab.id ? "font-semibold" : ""
              )}
              style={{
                backgroundColor:
                  activeTab === tab.id ? COLORS.brand.light + "30" : "transparent",
                color:
                  activeTab === tab.id ? COLORS.brand.primary : COLORS.text.secondary,
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === "user-list" && <UserList />}

      {activeTab === "inquiries" && (
        <div className="space-y-6">
          <div>
            <h2
              className={cn(
                TYPOGRAPHY.h3.fontSize,
                TYPOGRAPHY.h3.fontWeight,
                TYPOGRAPHY.h3.lineHeight
              )}
              style={{ color: TYPOGRAPHY.h3.color }}
            >
              문의사항 관리
            </h2>
            <p
              className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
              style={{ color: COLORS.text.tertiary }}
            >
              사용자 문의사항을 확인하고 관리하세요.
            </p>
          </div>
          <InquiryList />
        </div>
      )}

      {activeTab === "feedbacks" && (
        <div className="space-y-6">
          <div>
            <h2
              className={cn(
                TYPOGRAPHY.h3.fontSize,
                TYPOGRAPHY.h3.fontWeight,
                TYPOGRAPHY.h3.lineHeight
              )}
              style={{ color: TYPOGRAPHY.h3.color }}
            >
              피드백 관리
            </h2>
            <p
              className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
              style={{ color: COLORS.text.tertiary }}
            >
              사용자 피드백을 확인하고 관리하세요.
            </p>
          </div>
          <UserFeedbackList />
        </div>
      )}

      {activeTab === "survey-results" && (
        <div className="space-y-6">
          <div>
            <h2
              className={cn(
                TYPOGRAPHY.h3.fontSize,
                TYPOGRAPHY.h3.fontWeight,
                TYPOGRAPHY.h3.lineHeight
              )}
              style={{ color: TYPOGRAPHY.h3.color }}
            >
              설문 결과
            </h2>
            <p
              className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
              style={{ color: COLORS.text.tertiary }}
            >
              설문 응답 결과를 확인하고 분석하세요.
            </p>
          </div>
          <SurveyResultsView />
        </div>
      )}

      {activeTab === "account-deletions" && (
        <div className="space-y-6">
          <div>
            <h2
              className={cn(
                TYPOGRAPHY.h3.fontSize,
                TYPOGRAPHY.h3.fontWeight,
                TYPOGRAPHY.h3.lineHeight
              )}
              style={{ color: TYPOGRAPHY.h3.color }}
            >
              탈퇴 사유 관리
            </h2>
            <p
              className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
              style={{ color: COLORS.text.tertiary }}
            >
              계정 탈퇴 사유를 확인하고 분석하세요.
            </p>
          </div>
          <AccountDeletionsPage />
        </div>
      )}
    </div>
  );
}
