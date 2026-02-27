import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIVID",
  description: "오늘의 기록을 남기고 분석하는 일기 앱",
  metadataBase: new URL("https://vividlog.app"),
  openGraph: {
    title: "흐릿한 꿈을 '선명한 확신'으로",
    description: "기록을 통해, 나다운 삶을 선명하게",
    siteName: "VIVID",
    url: "/",
    type: "website",
    images: [
      {
        url: "/kakao-sharee.jpg",
      },
    ],
  },
  twitter: {
    title: "흐릿한 꿈을 '선명한 확신'으로",
    description: "기록을 통해, 나다운 삶을 선명하게.",
    card: "summary_large_image",
    images: ["/kakao-sharee.jpg"],
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

/**
 * 루트 레이아웃 - Provider 없음 (useContext 0%).
 * /404 prerender 시 안전. 앱 페이지는 (app)/layout.tsx에서 Provider 적용.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased hide-scrollbar">{children}</body>
    </html>
  );
}
