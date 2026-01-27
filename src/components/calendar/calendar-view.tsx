'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Event } from '@/types/database';
import { PRODUCT_COLOR_MAP } from '@/lib/constants';
import { addDays, format, differenceInDays } from 'date-fns';

export default function CalendarView({ events, onDateClick }: { events: Event[], onDateClick: (date: string) => void }) {
  
  // 1. 이벤트 데이터 변환 및 정렬 로직 강화
  const calendarEvents = events.map(ev => {
    const colorConfig = PRODUCT_COLOR_MAP[ev.product] || { hex: '#64748b' };
    
    // 종료일이 exclusive 정책이므로 1일 추가
    const endDateObj = ev.end_date ? new Date(ev.end_date) : new Date(ev.start_date);
    const adjustedEndDate = format(addDays(endDateObj, 1), 'yyyy-MM-dd');
    
    // 기간 계산 (Sorting을 위한 가중치)
    const duration = differenceInDays(endDateObj, new Date(ev.start_date)) + 1;

    return {
      id: ev.id,
      title: ev.event_name,
      start: ev.start_date,
      end: adjustedEndDate,
      backgroundColor: colorConfig.hex,
      borderColor: colorConfig.hex,
      textColor: '#ffffff',
      extendedProps: { 
        ...ev,
        duration: duration // 기간 정보를 추가하여 정렬에 활용
      }
    };
  });

  const renderEventContent = (eventInfo: any) => {
    const { product } = eventInfo.event.extendedProps;
    return (
      <div className="flex items-center w-full px-1.5 py-0.5 overflow-hidden text-white leading-tight font-black">
        <span className="text-[8px] opacity-80 uppercase mr-1 shrink-0">[{product}]</span>
        <span className="text-[9px] truncate">{eventInfo.event.title}</span>
      </div>
    );
  };

  return (
    <div className="p-2 lg:p-8 calendar-container bg-white rounded-[3rem]">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ko"
        events={calendarEvents}
        
        // ✅ [Stacking 최적화]: 기간이 긴 학회(-duration)가 먼저 오고, 그 다음 학회명 순으로 정렬
        eventOrder="-duration,start,title"
        
        dateClick={(info) => onDateClick(info.dateStr)}
        eventClick={(info) => onDateClick(info.event.startStr)}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
        height="auto"
        aspectRatio={1.3}
        eventContent={renderEventContent}
        dayMaxEvents={3}
        moreLinkContent={(args) => `+${args.num}건 더보기`}
      />
      <style jsx global>{`
        .fc-event { border-radius: 4px !important; margin: 1px 1px !important; cursor: pointer; border: none !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .fc-daygrid-day-number { font-weight: 900; color: #cbd5e1; font-size: 0.75rem; padding: 8px 12px !important; text-decoration: none !important; }
        .fc-toolbar-title { font-weight: 900 !important; color: #0f172a; font-size: 1.15rem !important; font-style: italic; letter-spacing: -0.05em; }
        .fc-col-header-cell-cushion { font-weight: 900; color: #64748b; font-size: 0.7rem; padding: 10px !important; text-decoration: none !important; text-transform: uppercase; }
        .fc-day-today { background-color: #f8fafc !important; }
      `}</style>
    </div>
  );
}