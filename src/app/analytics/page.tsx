'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, TrendingUp, ChevronLeft, Target, LayoutDashboard, Calendar, Filter, MapPin, Clock
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

        // 1. 기간 필터링
        if (!isWithinInterval(evDate, { start, end })) return false;

        // 2. 평일/주말 필터링 (0: 일요일, 6: 토요일)
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
      <div className="absolute top-0 left-0 right-0 h-96 bg-slate-900 rounded-b-[6rem] shadow-inner"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 pt-12 space-y-12">
        <div className="flex justify-between items-center text-white">
          <Link href="/" className="inline-flex items-center gap-2 font-black italic opacity-60 hover:opacity-100 transition-all uppercase tracking-tighter">
            <ChevronLeft className="h-5 w-5" /> TPKR Hub
          </Link>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Intelligence Data Center</span>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter italic uppercase text-white leading-[0.9]">Member<br/><span className="text-blue-500 underline decoration-blue-500/20 underline-offset-8">Analytics</span></h1>
            <p className="font-bold text-slate-400 text-lg">영업 부문별 실시간 학회 참석 정밀 지표입니다.</p>
          </div>
          
          {/* 통합 필터 패널 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-white/10 backdrop-blur-2xl p-6 rounded-[3rem] border border-white/10 shadow-3xl">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black text-blue-400 uppercase ml-2 tracking-widest">Start Date</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white border-none rounded-2xl font-black text-slate-900 h-12 px-4 text-xs shadow-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black text-blue-400 uppercase ml-2 tracking-widest">End Date</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white border-none rounded-2xl font-black text-slate-900 h-12 px-4 text-xs shadow-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black text-blue-400 uppercase ml-2 tracking-widest">Schedule Type</span>
              <Select value={dayType} onValueChange={setDayType}>
                <SelectTrigger className="bg-white border-none rounded-2xl font-black text-slate-900 h-12 px-4 shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">전체 일정</SelectItem><SelectItem value="weekday">평일 학회 (월-금)</SelectItem><SelectItem value="weekend">주말 학회 (토-일)</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black text-blue-400 uppercase ml-2 tracking-widest">Division</span>
              <Select value={selectedAffiliation} onValueChange={setSelectedAffiliation}>
                <SelectTrigger className="bg-white border-none rounded-2xl font-black text-slate-900 h-12 px-4 shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">전체 추진부</SelectItem><SelectItem value="영업제1추진부">영업제1추진부</SelectItem><SelectItem value="영업제2추진부">영업제2추진부</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black text-blue-400 uppercase ml-2 tracking-widest">Team Group</span>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="bg-white border-none rounded-2xl font-black text-slate-900 h-12 px-4 shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 그룹</SelectItem>
                  {['서울1그룹', '서울2그룹', '서울3그룹', '대구그룹', '부산그룹', '호남그룹'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* No.1 하이라이트 */}
          <Card className="lg:col-span-1 border-none shadow-3xl bg-white rounded-[4.5rem] p-12 flex flex-col justify-between min-h-[500px] ring-1 ring-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 transition-transform group-hover:scale-125 duration-700"><TrendingUp className="h-40 w-40 text-blue-600" /></div>
            <div className="space-y-8 relative z-10">
              <div className="h-20 w-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-200"><Award className="h-10 w-10" /></div>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Active MVP Member</p>
                <h3 className="text-7xl font-black tracking-tighter italic text-slate-900 leading-none">{stats[0]?.name || '-'}</h3>
              </div>
            </div>
            <div className="space-y-6 pt-10 border-t border-slate-50 relative z-10">
              <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 flex items-center justify-between shadow-inner">
                <div>
                  <p className="text-sm font-black text-blue-600">{stats[0]?.affiliation}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{stats[0]?.group}</p>
                </div>
                <div className="text-right">
                  <span className="text-6xl font-black text-slate-900 leading-none">{stats[0]?.count || 0}</span>
                  <p className="text-[10px] font-black text-slate-300 uppercase mt-2">Times</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 리스트 현황 */}
          <Card className="lg:col-span-2 border-none shadow-3xl bg-white rounded-[4.5rem] overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/50 border-b p-12 flex items-center justify-between">
              <CardTitle className="text-xs font-black flex items-center gap-3 text-slate-400 uppercase tracking-[0.4em]">
                <Target className="h-6 w-6 text-blue-600" /> Participation Metrics
              </CardTitle>
              <div className="px-4 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest italic">Live Statistics</div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 max-h-[700px] overflow-y-auto scrollbar-hide">
                {stats.length > 0 ? stats.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between p-10 hover:bg-slate-50/80 transition-all group border-l-[12px] border-transparent hover:border-blue-600">
                    <div className="flex items-center gap-12">
                      <span className={`text-5xl font-black italic tracking-tighter ${i < 3 ? 'text-blue-600' : 'text-slate-100'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-black text-slate-800 text-3xl group-hover:text-blue-600 transition-colors tracking-tight">{s.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                          <MapPin className="h-3 w-3" /> {s.affiliation} · {s.group}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">{s.count}</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">Times</span>
                      </div>
                      <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                          style={{ width: `${(s.count / (Math.max(...stats.map(x => x.count)) || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-48 text-center flex flex-col items-center gap-6">
                    <Clock className="h-16 w-16 text-slate-100" />
                    <p className="text-slate-200 font-black italic uppercase tracking-widest">No Attendance Results</p>
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