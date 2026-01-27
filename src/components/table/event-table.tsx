'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types/database';
import { PRODUCT_COLOR_MAP } from '@/lib/constants';
import { MapPin, Calendar, Users, UserPlus, CheckCircle2, XCircle } from 'lucide-react';

export default function EventTable({ events, onUpdate }: { events: Event[], onUpdate: () => void }) {
  const [inputName, setInputName] = useState<Record<string, string>>({});

  // 3 & 5. 참석자 추가 및 실적 반영 로직
  const handleJoin = async (eventId: string, currentAttendees: string[]) => {
    const name = inputName[eventId]?.trim();
    if (!name) return alert('이름을 입력해주세요.');

    // 중복 체크 로직 추가
    if (currentAttendees && currentAttendees.includes(name)) {
      return alert('이미 등록된 참석자입니다.');
    }

    const newAttendees = [...(currentAttendees || []), name];
    
    const { error } = await supabase
      .from('events')
      .update({ attendees: newAttendees })
      .eq('id', eventId);
    
    if (!error) {
      alert(`${name} 담당자가 추가되었습니다.`);
      setInputName({ ...inputName, [eventId]: '' });
      onUpdate(); // 부모 컴포넌트의 데이터를 새로고침하여 분석 실적에 즉시 반영
    } else {
      alert('데이터 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 4. 참석자 삭제(취소) 기능
  const handleRemoveAttendee = async (eventId: string, currentAttendees: string[], targetName: string) => {
    if (confirm(`${targetName} 담당자를 명단에서 삭제하시겠습니까?`)) {
      const newAttendees = currentAttendees.filter(name => name !== targetName);
      
      const { error } = await supabase
        .from('events')
        .update({ attendees: newAttendees })
        .eq('id', eventId);

      if (!error) {
        onUpdate(); // 삭제 후 즉시 실적 데이터 동기화
      }
    }
  };

  if (events.length === 0) return (
    <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
      <p className="text-slate-300 font-black italic">No events found for this selection.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
      {events.map((ev) => {
        const color = PRODUCT_COLOR_MAP[ev.product] || { bg: 'bg-slate-100', text: 'text-slate-600' };
        
        return (
          <div key={ev.id} className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-50 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex justify-between items-start">
                <span className={`px-4 py-1.5 rounded-full ${color.bg} ${color.text} text-[10px] font-black uppercase tracking-widest`}>
                  {ev.product}
                </span>
                {ev.pm_attend && (
                  <span className="flex items-center text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> PM 참석
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{ev.event_name}</h3>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter italic">Organized by {ev.organizer}</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <Calendar className="h-4 w-4 text-blue-500" /> {ev.start_date}
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <MapPin className="h-4 w-4 text-blue-500" /> {ev.location}
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-blue-500 mt-1" />
                  <div className="flex flex-wrap gap-1">
                    {ev.attendees && ev.attendees.length > 0 ? (
                      ev.attendees.map(name => (
                        <button 
                          key={name} 
                          onClick={() => handleRemoveAttendee(ev.id, ev.attendees, name)}
                          className="px-2 py-1 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg text-[10px] font-black text-slate-600 transition-colors flex items-center gap-1 group/btn"
                        >
                          {name}
                          <XCircle className="h-2 w-2 opacity-0 group-hover/btn:opacity-100" />
                        </button>
                      ))
                    ) : (
                      <span className="text-xs font-bold text-slate-300 italic">No attendees yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <div className="flex gap-2">
                <input 
                  placeholder="담당자 이름 입력"
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                  value={inputName[ev.id] || ''}
                  onChange={(e) => setInputName({ ...inputName, [ev.id]: e.target.value })}
                />
                <button 
                  onClick={() => handleJoin(ev.id, ev.attendees || [])}
                  className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}