import type { Metadata, Viewport } from "next";
import "./globals.css";
import { JournalProvider } from "./providers";
import { BottomNavigation } from "../components/common/BottomNavigation";
import { GlobalModals } from "../components/ui/modals/GlobalModals";
import { Footer } from "../components/common/Footer";

export const metadata: Metadata = {
  title: "VIVID",
  description: "오늘의 기록을 남기고 분석하는 일기 앱",
  metadataBase: new URL("https://vividlog.app"),
  openGraph: {
    title: "당신의 꿈을 '선명한 확신'으로",
    description: "기록을 통해, 흐릿한 삶을 선명하게",
    siteName: "VIVID",
    url: "/",
    type: "website",
    images: [
      {
        url: "/kakao-share-image.jpg",
      },
    ],
  },
  twitter: {
    title: "당신의 꿈을 '선명한 확신'으로",
    description: "기록을 통해, 흐릿한 삶을 선명하게.",
    card: "summary_large_image",
    images: ["/kakao-share-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
  appleWebApp: {
    title: "VIVID",
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
