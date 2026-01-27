'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Event } from '@/types/database';
import { PRODUCT_COLOR_MAP } from '@/lib/constants';
import { addDays, format } from 'date-fns';

export default function CalendarView({ events, onDateClick }: { events: Event[], onDateClick: (date: string) => void }) {
  
  const calendarEvents = events.map(ev => {
    const colorConfig = PRODUCT_COLOR_MAP[ev.product] || { hex: '#64748b' };
    
    // FullCalendar 종료일 처리 (exclusive 정책상 +1일)
    const adjustedEndDate = ev.end_date 
      ? format(addDays(new Date(ev.end_date), 1), 'yyyy-MM-dd') 
      : ev.start_date;

    return {
      id: ev.id,
      title: ev.event_name,
      start: ev.start_date,
      end: adjustedEndDate,
      backgroundColor: colorConfig.hex,
      borderColor: colorConfig.hex,
      textColor: '#ffffff',
      extendedProps: { ...ev }
    };
  });

  const renderEventContent = (eventInfo: any) => {
    const { product } = eventInfo.event.extendedProps;
    return (
      <div className="flex items-center w-full px-1.5 py-0.5 overflow-hidden text-white leading-tight">
        <span className="text-[8px] font-black opacity-90 uppercase mr-1 shrink-0">[{product}]</span>
        <span className="text-[9px] font-black truncate">{eventInfo.event.title}</span>
      </div>
    );
  };

  return (
    <div className="p-2 lg:p-8 calendar-container bg-white rounded-[2.5rem] lg:rounded-[4rem]">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ko"
        events={calendarEvents}
        dateClick={(info) => onDateClick(info.dateStr)}
        eventClick={(info) => onDateClick(info.event.startStr)}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
        height="auto"
        aspectRatio={1.2}
        eventContent={renderEventContent}
        dayMaxEvents={3}
        moreLinkContent={(args) => `+${args.num}건`}
      />
      <style jsx global>{`
        .fc-event { border-radius: 4px !important; margin: 1px 1px !important; cursor: pointer; border: none !important; }
        .fc-daygrid-day-number { font-weight: 900; color: #cbd5e1; font-size: 0.75rem; padding: 10px !important; text-decoration: none !important; }
        .fc-toolbar-title { font-weight: 900 !important; color: #0f172a; font-size: 1.15rem !important; font-style: italic; }
        .fc-col-header-cell-cushion { font-weight: 900; color: #64748b; font-size: 0.7rem; padding: 12px !important; text-decoration: none !important; }
        .fc-day-today { background-color: #f8fafc !important; }
      `}</style>
    </div>
  );
}