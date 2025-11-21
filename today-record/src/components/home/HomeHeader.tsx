"use client";

import { User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function HomeHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <header className="mb-6">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="mb-1" style={{ color: "#333333", fontSize: "1.5rem" }}>
            오늘의 기록
          </h1>
          <p
            style={{
              color: "#4E4B46",
              opacity: 0.7,
              fontSize: "0.9rem",
            }}
          >
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:bg-gray-50 focus:outline-none focus:ring-0"
                style={{
                  backgroundColor: "#F3F4F6",
                  border: "1px solid #EFE9E3",
                }}
              >
                <User className="w-3.5 h-3.5" style={{ color: "#6B7A6F" }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[160px]"
              style={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              {/* <DropdownMenuItem
                className="focus:outline-none cursor-pointer transition-colors"
                style={{
                  color: "#333333",
                  padding: "0.625rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F3F4F6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <Settings
                  className="w-4 h-4 mr-2"
                  style={{ color: "#6B7A6F" }}
                />
                설정
              </DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="focus:outline-none cursor-pointer transition-colors"
                style={{
                  color: "#DC2626",
                  padding: "0.625rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FEF2F2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <LogOut className="w-4 h-4 mr-2" style={{ color: "#DC2626" }} />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
