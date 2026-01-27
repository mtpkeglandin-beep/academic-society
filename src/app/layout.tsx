import type { Metadata, Viewport } from "next";
import "./globals.css";

// 뷰포트 설정 (모바일 최적화 유지)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // TPKR 브랜드 컬러(파란색 계열)에 맞춘 테마 색상
  themeColor: "#1e3a8a", 
};

// 메타데이터 및 아이콘 설정 (새로운 브랜딩 반영)
export const metadata: Metadata = {
  // 브라우저 탭 및 공유 시 나타날 제목
  title: "TPKR Academic Society Scheduler",
  // 공유 시 나타날 설명란
  description: "타나베파마코리아 영업본부 학회 일정 통합 관리 및 참석 현황 분석 시스템입니다.",
  
  icons: {
    // 아이콘 파일 경로 (public/schedule-icon.png 파일이 있어야 함)
    icon: '/schedule-icon.png',
    apple: '/schedule-icon.png',
    shortcut: '/schedule-icon.png',
  },
  
  // iOS 웹앱 설정 (홈 화면 추가 시)
  appleWebApp: {
    // 홈 화면 아이콘 아래에 표시될 이름
    title: "TPKR Scheduler",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  
  // 오픈 그래프 (소셜 미디어 공유용 카드 설정)
  openGraph: {
    title: "TPKR Academic Society Scheduler",
    description: "타나베파마코리아 영업본부 주요 학회 일정 확인 및 참석 현황 분석을 위한 통합 플랫폼입니다.",
    // opengraph-image.tsx가 자동으로 이미지를 생성해 연결합니다.
    siteName: "TPKR Academic Society Scheduler",
    locale: "ko_KR",
    type: "website",
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