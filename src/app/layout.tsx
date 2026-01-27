import type { Metadata, Viewport } from "next";
import "./globals.css";

// 뷰포트 설정 (모바일에서 앱처럼 보이게 하기 위함)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a", // 아이콘 배경색과 맞춘 어두운 남색
};

// 메타데이터 및 아이콘 설정
export const metadata: Metadata = {
  title: "EGLANDIN Schedule",
  description: "한국다나베제약 학회 일정 관리 시스템",
  icons: {
    // 안드로이드 및 웹 브라우저용 아이콘 (public 폴더 기준 경로)
    icon: '/schedule-icon.png',
    // iOS 홈 화면용 아이콘 (apple-touch-icon 역할)
    apple: '/schedule-icon.png',
    // 즐겨찾기 아이콘 (선택사항, 동일하게 설정)
    shortcut: '/schedule-icon.png',
  },
  appleWebApp: {
    title: "EGLANDIN Schedule",
    statusBarStyle: "black-translucent",
    capable: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased bg-[#f1f5f9]">{children}</body>
    </html>
  );
}