'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, TrendingUp, ChevronLeft, Target, LayoutDashboard, 
  Calendar, Filter, MapPin, Clock, Award 
} from "lucide-react";
import { parseISO, isWithinInterval, getDay, format, startOfYear, endOfYear } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types/database';
import { EMPLOYEES } from '@/lib/constants';

export default function AnalyticsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  
  // 고도화 필터 상태
  const [startDate, setStartDate] = useState(format(startOfYear(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfYear(new Date()), 'yyyy-MM-dd'));
  const [dayType, setDayType] = useState('all'); // all, weekday, weekend
  const [selectedAffiliation, setSelectedAffiliation] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*');
      if (data) setEvents(data as Event[]);
    };
    fetchEvents();
  }, []);

  const stats = useMemo(() => {
    const filteredEvents = events.filter(ev => {
      try {
        const evDate = parseISO(ev.start_date);
        const start = parseISO(startDate);
        const end = parseISO(endDate);

        if (!isWithinInterval(evDate, { start, end })) return false;

        const day = getDay(evDate);
        const isWeekend = (day === 0 || day === 6);
        if (dayType === 'weekday' && isWeekend) return false;
        if (dayType === 'weekend' && !isWeekend) return false;

        return true;
      } catch { return false; }
    });
    
    const counts: Record<string, number> = {};
    filteredEvents.forEach(ev => { 
      ev.attendees?.forEach(name => { counts[name.trim()] = (counts[name.trim()] || 0) + 1; }); 
    });

    return EMPLOYEES.map(emp => ({ ...emp, count: counts[emp.name] || 0 }))
      .filter(s => {
        const matchAff = selectedAffiliation === 'all' || s.affiliation === selectedAffiliation;
        const matchGroup = selectedGroup === 'all' || s.group === selectedGroup;
        return matchAff && matchGroup;
      })
      .sort((a, b) => b.count - a.count);
  }, [events, startDate, endDate, dayType, selectedAffiliation, selectedGroup]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-slate-900 font-sans">
      <div className="absolute top-0 left-0 right-0 h-80 lg:h-96 bg-slate-900 rounded-b-[4rem] lg:rounded-b-[6rem] shadow-inner"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6 pt-12 space-y-10 lg:space-y-12">
        <div className="flex justify-between items-center text-white">
          <Link href="/" className="inline-flex items-center gap-2 font-black italic opacity-60 hover:opacity-100 transition-all uppercase tracking-tighter">
            <ChevronLeft className="h-5 w-5" /> TPKR Hub
          </Link>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">Intelligence Data Center</span>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 lg:gap-10">
          <div className="space-y-3 lg:space-y-4 text-center lg:text-left">
            <h1 className="text-5xl lg:text-8xl font-black tracking-tighter italic uppercase text-white leading-[0.9]">Member<br/><span className="text-blue-500">Analytics</span></h1>
            <p className="font-bold text-slate-400 text-sm lg:text-lg">영업 부문별 실시간 학회 참석 정밀 지표입니다.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-4 bg-white/10 backdrop-blur-2xl p-4 lg:p-6 rounded-[2.5rem] border border-white/10 shadow-3xl">
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] lg:text-[9px] font-black text-blue-400 uppercase ml-1 tracking-widest">Start Date</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white border-none rounded-xl font-black text-slate-900 h-10 lg:h-12 px-3 text-[10px] lg:text-xs shadow-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] lg:text-[9px] font-black text-blue-400 uppercase ml-1 tracking-widest">End Date</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white border-none rounded-xl font-black text-slate-900 h-10 lg:h-12 px-3 text-[10px] lg:text-xs shadow-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] lg:text-[9px] font-black text-blue-400 uppercase ml-1 tracking-widest">Type</span>
              <Select value={dayType} onValueChange={setDayType}>
                <SelectTrigger className="bg-white border-none rounded-xl font-black text-slate-900 h-10 lg:h-12 px-3 text-[10px] shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">전체</SelectItem><SelectItem value="weekday">평일</SelectItem><SelectItem value="weekend">주말</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] lg:text-[9px] font-black text-blue-400 uppercase ml-1 tracking-widest">Division</span>
              <Select value={selectedAffiliation} onValueChange={setSelectedAffiliation}>
                <SelectTrigger className="bg-white border-none rounded-xl font-black text-slate-900 h-10 lg:h-12 px-3 text-[10px] shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">전체 추진부</SelectItem><SelectItem value="영업제1추진부">영업제1추진부</SelectItem><SelectItem value="영업제2추진부">영업제2추진부</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] lg:text-[9px] font-black text-blue-400 uppercase ml-1 tracking-widest">Team</span>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="bg-white border-none rounded-xl font-black text-slate-900 h-10 lg:h-12 px-3 text-[10px] shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 그룹</SelectItem>
                  {['서울1그룹', '서울2그룹', '서울3그룹', '대구그룹', '부산그룹', '호남그룹'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <Card className="lg:col-span-1 border-none shadow-3xl bg-white rounded-[3.5rem] lg:rounded-[4.5rem] p-10 lg:p-12 flex flex-col justify-between min-h-[400px] lg:min-h-[500px] ring-1 ring-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 transition-transform group-hover:scale-125 duration-700 hidden lg:block"><TrendingUp className="h-40 w-40 text-blue-600" /></div>
            <div className="space-y-6 lg:space-y-8 relative z-10">
              <div className="h-16 w-16 lg:h-20 lg:w-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-200"><Award className="h-8 w-8 lg:h-10 lg:w-10" /></div>
              <div className="space-y-2">
                <p className="text-[10px] lg:text-xs font-black text-slate-300 uppercase tracking-widest">Active MVP Member</p>
                <h3 className="text-5xl lg:text-7xl font-black tracking-tighter italic text-slate-900 leading-none">{stats[0]?.name || '-'}</h3>
              </div>
            </div>
            <div className="space-y-4 lg:space-y-6 pt-8 border-t border-slate-50 relative z-10">
              <div className="bg-slate-50 p-6 lg:p-8 rounded-[2.5rem] lg:rounded-[3rem] border border-slate-100 flex items-center justify-between shadow-inner">
                <div>
                  <p className="text-xs lg:text-sm font-black text-blue-600">{stats[0]?.affiliation}</p>
                  <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{stats[0]?.group}</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl lg:text-6xl font-black text-slate-900 leading-none">{stats[0]?.count || 0}</span>
                  <p className="text-[9px] lg:text-[10px] font-black text-slate-300 uppercase mt-1">Times</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-3xl bg-white rounded-[3.5rem] lg:rounded-[4.5rem] overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/50 border-b p-8 lg:p-12 flex items-center justify-between">
              <CardTitle className="text-[10px] lg:text-xs font-black flex items-center gap-2 lg:gap-3 text-slate-400 uppercase tracking-[0.2em] lg:tracking-[0.4em]">
                <Target className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" /> Participation Metrics
              </CardTitle>
              <div className="px-3 py-1.5 lg:px-4 lg:py-2 bg-slate-900 text-white rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-widest italic">Live</div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 max-h-[600px] lg:max-h-[700px] overflow-y-auto scrollbar-hide">
                {stats.length > 0 ? stats.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between p-6 lg:p-10 hover:bg-slate-50/80 transition-all group border-l-[8px] lg:border-l-[12px] border-transparent hover:border-blue-600">
                    {/* ✅ 모바일 레이아웃 최적화: gap 조절 및 텍스트 크기 유동적 변경 */}
                    <div className="flex items-center gap-4 lg:gap-12 flex-1 min-w-0">
                      <span className={`text-2xl lg:text-5xl font-black italic tracking-tighter shrink-0 w-8 lg:w-16 ${i < 3 ? 'text-blue-600' : 'text-slate-100'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-slate-800 text-lg lg:text-3xl group-hover:text-blue-600 transition-colors tracking-tight truncate">{s.name}</p>
                        {/* ✅ 소속/그룹 정보가 모바일에서 겹치지 않게 가독성 보강 */}
                        <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 flex items-center gap-1.5 truncate opacity-70">
                          <MapPin className="h-2.5 w-2.5 shrink-0" /> {s.affiliation} · {s.group}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-2xl lg:text-5xl font-black text-slate-900 tracking-tighter">{s.count}</span>
                        <span className="text-[8px] lg:text-[10px] font-bold text-slate-300 uppercase">회</span>
                      </div>
                      {/* ✅ 게이지 바 크기 모바일 최적화 */}
                      <div className="w-16 lg:w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-1000" 
                          style={{ width: `${(s.count / (Math.max(...stats.map(x => x.count)) || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-32 lg:py-48 text-center flex flex-col items-center gap-4 lg:gap-6">
                    <Clock className="h-12 w-12 lg:h-16 lg:w-16 text-slate-100" />
                    <p className="text-slate-200 font-black italic uppercase tracking-widest text-xs lg:text-sm">No Results</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}