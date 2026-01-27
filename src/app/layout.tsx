import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e3a8a",
};

export const metadata: Metadata = {
  // 🔴 반드시 현재 Vercel에 배포된 실제 주소로 적어주세요.
  // 주소 끝에 '/'가 붙지 않도록 주의하세요.
  metadataBase: new URL('https://academic-society.vercel.app'), 
  
  title: "TPKR Academic Society Scheduler",
  description: "타나베파마코리아 영업본부 학회 일정 통합 관리 및 참석 현황 분석 시스템입니다.",
  
  icons: {
    icon: '/schedule-icon.png',
    shortcut: '/schedule-icon.png',
    apple: '/schedule-icon.png',
  },
  
  openGraph: {
    title: "TPKR Academic Society Scheduler",
    description: "타나베파마코리아 영업본부 주요 학회 일정 확인 및 참석 현황 분석을 위한 통합 플랫폼입니다.",
    siteName: "TPKR Academic Society Scheduler",
    locale: "ko_KR",
    type: "website",
    // 🔴 상대 경로인 '/opengraph-image.png'를 사용하면 metadataBase와 합쳐져 절대 경로가 됩니다.
    images: [
      {
        url: '/opengraph-image.png', 
        width: 1200,
        height: 630,
        alt: 'TPKR Scheduler 공유 이미지',
      },
    ],
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