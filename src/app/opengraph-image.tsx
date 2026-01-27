import { ImageResponse } from 'next/og';

// 이미지 크기 설정 (표준 권장 사이즈)
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// 이미지 생성 함수
export default function Image() {
  return new ImageResponse(
    (
      // 🎨 이미지 디자인 (CSS-in-JS 스타일링)
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // TPKR 브랜드 컬러를 활용한 전문적인 블루 그라데이션 배경
          background: 'linear-gradient(to bottom right, #1e3a8a, #2563eb)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 배경 데코레이션 (은은한 패턴) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.08, backgroundImage: 'radial-gradient(circle at 25px 25px, #ffffff 2%, transparent 0%), radial-gradient(circle at 75px 75px, #ffffff 2%, transparent 0%)', backgroundSize: '100px 100px' }}></div>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', borderRadius: '50%' }}></div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, textAlign: 'center' }}>
          {/* 메인 타이틀 (브랜드명) */}
          <h1 style={{ fontSize: '130px', fontWeight: 900, margin: 0, letterSpacing: '-0.03em', fontStyle: 'italic', textShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
            TPKR
          </h1>
          {/* 서브 타이틀 (앱 이름) */}
          <h2 style={{ fontSize: '36px', fontWeight: 700, margin: '15px 0 0 0', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.25em' }}>
            Schedule Hub
          </h2>
          {/* 설명 문구 */}
          <p style={{ fontSize: '26px', fontWeight: 500, marginTop: '40px', opacity: 0.9, padding: '14px 36px', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            영업본부 학회 일정 통합 관리 시스템
          </p>
        </div>
        
        {/* 하단 푸터 */}
        <div style={{ position: 'absolute', bottom: '30px', fontSize: '16px', opacity: 0.7, fontWeight: 500, letterSpacing: '0.05em' }}>
          Mitsubishi Tanabe Pharma Korea Co., Ltd.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}