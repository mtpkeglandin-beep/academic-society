'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Event } from '@/types/database';
import { PRODUCT_COLOR_MAP } from '@/lib/constants';

// --- [컴포넌트 정의] ---
export default function CalendarView({ 
  events, 
  onDateClick 
}: { 
  events: Event[], 
  onDateClick: (date: string) => void 
}) {
  
  // 1. FullCalendar용 이벤트 데이터 변환
  const calendarEvents = events.map(ev => {
    const colorConfig = PRODUCT_COLOR_MAP[ev.product] || { border: '#e2e8f0', text: '#1e293b', bg: '#f1f5f9' };
    
    return {
      id: ev.id,
      title: ev.event_name,
      start: ev.start_date,
      // 스타일 설정을 위한 커스텀 데이터 전달
      backgroundColor: 'transparent',
      borderColor: 'transparent', 
      textColor: colorConfig.text,
      extendedProps: { 
        ...ev,
        colorTheme: colorConfig 
      }
    };
  });

  // 2. 이벤트 커스텀 렌더링 (캘린더 칸 안에 제품 배지와 제목을 예쁘게 배치)
  const renderEventContent = (eventInfo: any) => {
    const { product, location, colorTheme } = eventInfo.event.extendedProps;
    
    return (
      <div className={`
        flex flex-col w-full p-1.5 rounded-lg border-l-4 shadow-sm transition-all
        hover:scale-[1.02] active:scale-95 group
        ${colorTheme.bg} ${colorTheme.border}
      `}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`
            text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter
            bg-white/80 ${colorTheme.text}
          `}>
            {product}
          </span>
          <span className="text-[10px] font-black truncate text-slate-900 group-hover:text-blue-600 transition-colors">
            {eventInfo.event.title}
          </span>
        </div>
        <div className="text-[8px] font-bold text-slate-400 truncate opacity-0 group-hover:opacity-100 lg:opacity-100 transition-all">
          📍 {location || '장소 미정'}
        </div>
      </div>
    );
  };

  // 3. 메인 렌더링 영역
  return (
    <div className="p-2 lg:p-8 calendar-container bg-white rounded-[2.5rem] lg:rounded-[4rem]">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ko"
        events={calendarEvents}
        
        // 상호작용 설정
        dateClick={(info) => onDateClick(info.dateStr)}
        eventClick={(info) => onDateClick(info.event.startStr)}
        
        // 헤더 설정
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        
        // 시각적 설정
        height="auto"
        aspectRatio={1.2}
        eventContent={renderEventContent} // 위에서 정의한 커스텀 렌더러 적용
        dayMaxEvents={2} // 모바일 가독성을 위해 칸당 최대 노출 이벤트 제한
        moreLinkContent={(args) => `+${args.num}건 더보기`}
        
        // 기타 속성
        fixedWeekCount={false}
        handleWindowResize={true}
        windowResizeDelay={100}
      />

      {/* 🎨 전역 스타일 오버라이드 (Premium Look) */}
      <style jsx global>{`
        /* 날짜 숫자 스타일 */
        .fc-daygrid-day-number { 
          font-weight: 900; 
          color: #cbd5e1; 
          font-size: 0.75rem; 
          padding: 8px 12px !important; 
          text-decoration: none !important;
        }
        
        /* 오늘 날짜 강조 */
        .fc-day-today { 
          background-color: #f8fafc !important; 
        }
        .fc-day-today .fc-daygrid-day-number {
          color: #3b82f6 !important;
          font-size: 0.9rem;
        }

        /* 헤더 툴바 */
        .fc-toolbar-title { 
          font-weight: 900 !important; 
          color: #0f172a; 
          font-size: 1.1rem !important; 
          letter-spacing: -0.05em;
          font-style: italic;
        }
        
        /* 요일 헤더 */
        .fc-col-header-cell-cushion { 
          font-weight: 900; 
          color: #64748b; 
          padding: 12px !important; 
          text-decoration: none !important; 
          font-size: 0.7rem;
          text-transform: uppercase;
        }

        /* 버튼 커스텀 */
        .fc-button-primary {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          color: #64748b !important;
          font-weight: 900 !important;
          border-radius: 0.75rem !important;
          font-size: 0.7rem !important;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .fc-button-primary:hover {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
        }
        .fc-button-active {
          background-color: #0f172a !important;
          color: white !important;
          border-color: #0f172a !important;
        }

        /* 그리드 보더 제거 및 둥근 모서리 */
        .fc-theme-standard td, .fc-theme-standard th { 
          border: 1px solid #f8fafc !important; 
        }
        .fc-scrollgrid { 
          border: none !important; 
        }

        /* 모바일 환경 대응 */
        @media (max-width: 768px) {
          .fc-event-main { padding: 0 !important; }
          .fc-daygrid-event { margin: 1px 2px !important; }
        }
      `}</style>
    </div>
  );
}