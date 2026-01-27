'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types/database';
import { PRODUCT_COLOR_MAP } from '@/lib/constants';
import { MapPin, Calendar, Users, UserPlus, CheckCircle2, XCircle, Trash2, AlertCircle } from 'lucide-react';

export default function EventTable({ events, onUpdate }: { events: Event[], onUpdate: () => void }) {
  const [inputName, setInputName] = useState<Record<string, string>>({});

  // 🗑️ 학회 일정 전체 삭제 기능
  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (confirm(`[${eventName}] 학회 일정을 정말 삭제하시겠습니까? 관련 참석 데이터가 모두 사라집니다.`)) {
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (!error) {
        alert('학회 일정이 삭제되었습니다.');
        onUpdate();
      } else {
        alert('삭제 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // ✅ 참석자 추가 (중복 방지 및 분석 실적 실시간 반영)
  const handleJoin = async (eventId: string, currentAttendees: string[]) => {
    const name = inputName[eventId]?.trim();
    if (!name) return alert('담당자 이름을 입력해주세요.');

    // 중복 체크 로직
    if (currentAttendees && currentAttendees.includes(name)) {
      return alert('이미 참석 명단에 등록된 이름입니다.');
    }

    const newAttendees = [...(currentAttendees || []), name];
    
    const { error } = await supabase
      .from('events')
      .update({ attendees: newAttendees })
      .eq('id', eventId);
    
    if (!error) {
      alert(`${name} 담당자가 추가되었습니다. 실적에 즉시 반영됩니다.`);
      setInputName({ ...inputName, [eventId]: '' });
      onUpdate(); // 부모 컴포넌트의 데이터를 새로고침하여 분석 실적 갱신
    }
  };

  // ❌ 참석자 개별 취소 기능
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
    <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
      <AlertCircle className="h-10 w-10 text-slate-200" />
      <p className="text-slate-300 font-black italic">해당 조건에 맞는 학회 일정이 없습니다.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
      {events.map((ev) => {
        const color = PRODUCT_COLOR_MAP[ev.product] || { bg: 'bg-slate-100', text: 'text-slate-600' };
        
        return (
          <div key={ev.id} className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-50 flex flex-col justify-between relative overflow-hidden">
            {/* 삭제 버튼 */}
            <button 
              onClick={() => handleDeleteEvent(ev.id, ev.event_name)}
              className="absolute top-6 right-6 p-2 text-slate-200 hover:text-red-500 transition-colors z-10"
              title="학회 삭제"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <span className={`px-4 py-1.5 rounded-full ${color.bg} ${color.text} text-[10px] font-black uppercase tracking-widest`}>
                  {ev.product}
                </span>
                {ev.pm_attend && (
                  <span className="flex items-center text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full animate-pulse">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> PM 참여
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                  {ev.event_name}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-tighter italic">
                  Organized by {ev.organizer}
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>{ev.start_date} {ev.end_date && ev.end_date !== ev.start_date ? `~ ${ev.end_date}` : ''}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="truncate">{ev.location}</span>
                </div>
                <div className="flex items-start gap-3 border-t border-slate-50 pt-4 mt-2">
                  <Users className="h-4 w-4 text-blue-500 mt-1" />
                  <div className="flex flex-wrap gap-1.5">
                    {ev.attendees && ev.attendees.length > 0 ? (
                      ev.attendees.map(name => (
                        <button 
                          key={name} 
                          onClick={() => handleRemoveAttendee(ev.id, ev.attendees, name)}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg text-[10px] font-black text-slate-600 transition-all flex items-center gap-1 group/btn"
                        >
                          {name}
                          <XCircle className="h-2.5 w-2.5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                      ))
                    ) : (
                      <span className="text-xs font-bold text-slate-300 italic py-1">No attendees registered</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100">
              <div className="flex gap-2">
                <input 
                  placeholder="참석 담당자 이름"
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 text-xs font-black focus:ring-2 focus:ring-blue-500 transition-all"
                  value={inputName[ev.id] || ''}
                  onChange={(e) => setInputName({ ...inputName, [ev.id]: e.target.value })}
                />
                <button 
                  onClick={() => handleJoin(ev.id, ev.attendees || [])}
                  className="bg-slate-900 text-white p-3.5 rounded-xl hover:bg-blue-600 transition-all active:scale-90 shadow-xl shadow-slate-100"
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