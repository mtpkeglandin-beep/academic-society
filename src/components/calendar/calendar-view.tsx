'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Event } from '@/types/database';
import { PRODUCT_COLOR_MAP } from '@/lib/constants';

export default function CalendarView({ events, onDateClick }: { events: Event[], onDateClick: (date: string) => void }) {
  const calendarEvents = events.map(ev => ({
    id: ev.id,
    // 제목에 모든 정보 포함
    title: `[${ev.product}] ${ev.event_name} @ ${ev.location}`,
    start: ev.start_date,
    backgroundColor: 'white',
    borderColor: PRODUCT_COLOR_MAP[ev.product]?.border.replace('border-', '') || '#e2e8f0',
    textColor: '#1e293b',
    extendedProps: { ...ev }
  }));

  return (
    <div className="p-4 lg:p-8 calendar-container bg-white">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ko"
        events={calendarEvents}
        dateClick={(info) => onDateClick(info.dateStr)} // 날짜 클릭 시 부모에게 전달
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        height="750px"
        eventDisplay="block"
        eventClassNames="font-black text-[10px] p-2 mb-1 rounded-xl shadow-sm border-l-4 transition-all hover:scale-[1.02] cursor-pointer overflow-hidden truncate"
        dayMaxEvents={3}
      />
      <style jsx global>{`
        .fc-daygrid-day-number { font-weight: 900; color: #94a3b8; font-size: 0.8rem; padding: 10px !important; }
        .fc-col-header-cell-cushion { font-weight: 900; color: #1e293b; padding: 15px !important; text-decoration: none !important; }
        .fc-theme-standard td, .fc-theme-standard th { border: 1px solid #f1f5f9 !important; }
        .fc-scrollgrid { border-radius: 2rem; overflow: hidden; border: none !important; }
        .fc-day-today { background-color: #eff6ff !important; }
      `}</style>
    </div>
  );
}