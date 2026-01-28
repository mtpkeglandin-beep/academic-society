'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types/database';
import { PRODUCT_COLOR_MAP } from '@/lib/constants';
import { MapPin, Calendar, Users, UserPlus, CheckCircle2, XCircle, Trash2, LayoutGrid } from 'lucide-react';

export default function EventTable({ events, onUpdate }: { events: Event[], onUpdate: () => void }) {
  const [inputName, setInputName] = useState<Record<string, string>>({});

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (confirm(`[${eventName}] 일정을 삭제하시겠습니까?`)) {
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (!error) onUpdate();
    }
  };

  const handleJoin = async (eventId: string, currentAttendees: string[]) => {
    const name = inputName[eventId]?.trim();
    if (!name) return;
    const newAttendees = [...(currentAttendees || []), name];
    const { error } = await supabase.from('events').update({ attendees: newAttendees }).eq('id', eventId);
    if (!error) {
      setInputName({ ...inputName, [eventId]: '' });
      onUpdate();
    }
  };

  if (events.length === 0) return (
    <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
      <p className="text-slate-300 font-black italic">표시할 학회가 없습니다.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {events.map((ev) => {
        const color = PRODUCT_COLOR_MAP[ev.product] || { hex: '#e2e8f0' };
        
        return (
          <div key={ev.id} className="group bg-white rounded-[3rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-50 flex flex-col justify-between relative overflow-hidden ring-1 ring-slate-50">
            <button onClick={() => handleDeleteEvent(ev.id, ev.event_name)} className="absolute top-8 right-8 p-2 text-slate-200 hover:text-red-500 transition-colors z-10"><Trash2 className="h-5 w-5" /></button>

            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <span className="px-6 py-2 rounded-2xl text-black text-2xl font-black uppercase tracking-tighter shadow-md border-b-4 border-black/10" style={{ backgroundColor: color.hex }}>{ev.product}</span>
                <div className="flex flex-col items-end gap-1.5">
                   <span className="flex items-center gap-1.5 text-[11px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full ring-1 ring-blue-100">
                     <LayoutGrid className="h-3.5 w-3.5" /> {ev.booth_size || 1}부스 설치
                   </span>
                   {ev.pm_attend && <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 uppercase italic">PM Attended</span>}
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black leading-tight group-hover:text-blue-600 transition-colors tracking-tighter truncate">{ev.event_name}</h3>
                <p className="text-sm font-bold text-slate-400 mt-3 uppercase tracking-tighter italic">Organized by {ev.organizer || "Unknown"}</p>
              </div>

              <div className="space-y-5 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-4 text-base font-black text-slate-500 italic"><Calendar className="h-5 w-5 text-blue-500 shrink-0" /><span>{ev.start_date} ~ {ev.end_date}</span></div>
                <div className="flex items-center gap-4 text-base font-black text-slate-500"><MapPin className="h-5 w-5 text-blue-500 shrink-0" /><span className="truncate">{ev.location}</span></div>
                
                <div className="flex items-start gap-4 pt-4 border-t border-slate-50">
                  <Users className="h-5 w-5 text-blue-500 mt-1.5 shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {ev.attendees && ev.attendees.length > 0 ? ev.attendees.map(name => (
                      <button key={name} onClick={() => onUpdate()} className="px-4 py-2 bg-slate-50 rounded-xl text-sm font-black text-slate-700 border border-slate-100 shadow-sm flex items-center gap-2 group/btn">{name}<XCircle className="h-3 w-3 opacity-20" /></button>
                    )) : <span className="text-sm font-bold text-slate-300 italic py-1.5">미배정 학회</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex gap-3">
              <input placeholder="담당자 성함 입력" className="flex-1 bg-slate-50 border-none rounded-2xl px-5 text-sm font-black focus:ring-2 focus:ring-blue-500 h-14" value={inputName[ev.id] || ''} onChange={(e) => setInputName({ ...inputName, [ev.id]: e.target.value })} />
              <button onClick={() => handleJoin(ev.id, ev.attendees || [])} className="bg-slate-900 text-white px-6 rounded-2xl hover:bg-blue-600 shadow-xl transition-all h-14"><UserPlus className="h-5 w-5" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}