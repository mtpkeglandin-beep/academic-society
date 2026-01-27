'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types/database';
import { PRODUCT_COLOR_MAP } from '@/lib/constants';
import { MapPin, Calendar, Users, UserPlus, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

export default function EventTable({ events, onUpdate }: { events: Event[], onUpdate: () => void }) {
  const [inputName, setInputName] = useState<Record<string, string>>({});

  // 🗑️ 학회 일정 전체 삭제 기능
  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (confirm(`[${eventName}] 학회 일정을 정말 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.`)) {
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (!error) {
        alert('학회 일정이 삭제되었습니다.');
        onUpdate();
      }
    }
  };

  // ✅ 참석자 추가 로직
  const handleJoin = async (eventId: string, currentAttendees: string[]) => {
    const name = inputName[eventId]?.trim();
    if (!name) return alert('이름을 입력해주세요.');
    if (currentAttendees?.includes(name)) return alert('이미 등록된 이름입니다.');

    const newAttendees = [...(currentAttendees || []), name];
    const { error } = await supabase.from('events').update({ attendees: newAttendees }).eq('id', eventId);
    if (!error) {
      alert(`${name} 담당자가 추가되었습니다.`);
      setInputName({ ...inputName, [eventId]: '' });
      onUpdate();
    }
  };

  // ❌ 참석자 개별 취소 기능
  const handleRemoveAttendee = async (eventId: string, currentAttendees: string[], targetName: string) => {
    if (confirm(`${targetName} 담당자를 참석 명단에서 삭제하시겠습니까?`)) {
      const newAttendees = currentAttendees.filter(n => n !== targetName);
      const { error } = await supabase.from('events').update({ attendees: newAttendees }).eq('id', eventId);
      if (!error) onUpdate();
    }
  };

  if (events.length === 0) return (
    <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
      <p className="text-slate-300 font-black italic">해당 조건에 일치하는 일정이 없습니다.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {events.map((ev) => {
        // 제품별 고정 색상 설정 (EGL:빨강, HER:분홍, NOV:초록, RAD:하늘, UPL:자주, VAD:보라)
        const color = PRODUCT_COLOR_MAP[ev.product] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
        
        return (
          <div key={ev.id} className="group bg-white rounded-[3rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-50 flex flex-col justify-between relative overflow-hidden ring-1 ring-slate-50">
            {/* 삭제 버튼 */}
            <button 
              onClick={() => handleDeleteEvent(ev.id, ev.event_name)}
              className="absolute top-8 right-8 p-2 text-slate-200 hover:text-red-500 transition-colors z-10"
              title="학회 삭제"
            >
              <Trash2 className="h-5 w-5" />
            </button>

            <div className="space-y-8 text-slate-900">
              <div className="flex justify-between items-center">
                {/* 🏷️ 품목명 배지: 배경색과 테두리에 제품 고정 색상 적용 & 글자 크기 확대 */}
                <span className={`px-6 py-2 rounded-2xl ${color.bg} ${color.text} ${color.border} border-2 text-2xl font-black uppercase tracking-tighter shadow-sm`}>
                  {ev.product}
                </span>
                {ev.pm_attend && (
                  <span className="flex items-center text-[11px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-full ring-1 ring-blue-100 animate-pulse">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> PM 참석
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-3xl font-black leading-tight group-hover:text-blue-600 transition-colors tracking-tighter">
                  {ev.event_name}
                </h3>
                <p className="text-sm font-bold text-slate-400 mt-3 uppercase tracking-tighter italic">
                  Organized by {ev.organizer}
                </p>
              </div>

              <div className="space-y-5 pt-2">
                <div className="flex items-center gap-4 text-base font-black text-slate-500 italic">
                  <Calendar className="h-5 w-5 text-blue-500 shrink-0" />
                  <span>{ev.start_date} {ev.end_date && ev.end_date !== ev.start_date ? `~ ${ev.end_date}` : ''}</span>
                </div>
                <div className="flex items-center gap-4 text-base font-black text-slate-500">
                  <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                  <span className="truncate">{ev.location}</span>
                </div>
                
                <div className="flex items-start gap-4 border-t border-slate-50 pt-6 mt-4">
                  <Users className="h-5 w-5 text-blue-500 mt-1.5 shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {ev.attendees && ev.attendees.length > 0 ? (
                      ev.attendees.map(name => (
                        <button 
                          key={name} 
                          onClick={() => handleRemoveAttendee(ev.id, ev.attendees, name)}
                          // 👥 참석자 이름: 크기를 text-sm으로 키우고 디자인 강조
                          className="px-4 py-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-black text-slate-700 transition-all flex items-center gap-2 group/btn border border-slate-100 hover:border-red-100 shadow-sm"
                        >
                          {name}
                          <XCircle className="h-3 w-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                      ))
                    ) : (
                      <span className="text-sm font-bold text-slate-300 italic py-1.5">참석 담당자 없음</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex gap-3">
              <input 
                placeholder="담당자 이름"
                className="flex-1 bg-slate-50 border-none rounded-2xl px-5 text-sm font-black focus:ring-2 focus:ring-blue-500 transition-all h-14"
                value={inputName[ev.id] || ''}
                onChange={(e) => setInputName({ ...inputName, [ev.id]: e.target.value })}
              />
              <button 
                onClick={() => handleJoin(ev.id, ev.attendees || [])}
                className="bg-slate-900 text-white px-6 rounded-2xl hover:bg-blue-600 shadow-xl transition-all active:scale-90 h-14"
              >
                <UserPlus className="h-5 w-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}