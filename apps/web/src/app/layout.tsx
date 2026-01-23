import type { Metadata, Viewport } from "next";
import "./globals.css";
import { JournalProvider } from "./providers";
import { BottomNavigation } from "../components/common/BottomNavigation";
import { GlobalModals } from "../components/ui/modals/GlobalModals";
import { Footer } from "../components/common/Footer";

export const metadata: Metadata = {
  title: "vivid",
  description: "오늘의 기록을 남기고 분석하는 일기 앱",
  icons: {
    icon: "/vivid-logo.png",
    shortcut: "/vivid-logo.png",
    apple: "/vivid-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased hide-scrollbar">
        <JournalProvider>
          <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#e4e2dd" }}>
            <main className="flex-1 hide-scrollbar" style={{ overflowX: "hidden" }}>{children}</main>
            <Footer />
            <BottomNavigation />
            <GlobalModals />
          </div>
        </JournalProvider>
      </body>
    </html>
  );
}
