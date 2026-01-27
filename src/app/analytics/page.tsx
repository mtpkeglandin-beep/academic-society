'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  ChevronLeft, 
  Award, 
  Flame, 
  Target, 
  LayoutDashboard // 👈 빌드 에러를 일으켰던 누락된 아이콘 추가
} from "lucide-react";
import { subMonths, isWithinInterval } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types/database';
import { EMPLOYEES } from '@/lib/constants';

export default function AnalyticsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [period, setPeriod] = useState('12');
  const [selectedAffiliation, setSelectedAffiliation] = useState('all');

  // 🔄 실시간 데이터 로드
  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*');
      if (data) setEvents(data as Event[]);
    };
    fetchEvents();
  }, []);

  // 📊 실적 집계 로직
  const stats = useMemo(() => {
    const now = new Date();
    const startDate = subMonths(now, parseInt(period));
    
    const filteredEvents = events.filter(ev => {
      try {
        return isWithinInterval(new Date(ev.start_date), { start: startDate, end: now });
      } catch (e) { return false; }
    });
    
    const counts: Record<string, number> = {};
    filteredEvents.forEach(ev => { 
      ev.attendees?.forEach(name => { counts[name] = (counts[name] || 0) + 1; }); 
    });

    return EMPLOYEES.map(emp => ({ ...emp, count: counts[emp.name] || 0 }))
      .filter(s => selectedAffiliation === 'all' || s.affiliation === selectedAffiliation)
      .sort((a, b) => b.count - a.count);
  }, [events, period, selectedAffiliation]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 lg:pb-12 text-slate-900 font-sans">
      {/* 배경 데코레이션 */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-blue-600 rounded-b-[4rem] shadow-inner"></div>
      
      <div className="relative max-w-6xl mx-auto px-6 pt-8 lg:pt-12 space-y-8 lg:space-y-12">
        <div className="flex justify-between items-center text-white">
          <Link href="/" className="inline-flex items-center gap-2 font-bold opacity-80 hover:opacity-100 transition-all text-white">
            <ChevronLeft className="h-5 w-5" /> 대시보드
          </Link>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Internal Performance System</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 text-white">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter italic uppercase">Performance</h1>
            <p className="font-medium text-blue-100 opacity-80 text-sm lg:text-base tracking-tight">영업 부문별 실시간 학회 참석 실적 랭킹입니다.</p>
          </div>
          
          {/* 필터 섹션 */}
          <div className="flex flex-wrap gap-3 bg-white/10 backdrop-blur-md p-3 rounded-[2rem] border border-white/10">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px] lg:w-[160px] font-black bg-white/90 border-none h-12 rounded-2xl text-slate-900 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6개월</SelectItem>
                <SelectItem value="12">12개월</SelectItem>
                <SelectItem value="24">24개월</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAffiliation} onValueChange={setSelectedAffiliation}>
              <SelectTrigger className="w-[160px] lg:w-[200px] font-black bg-white/90 border-none h-12 rounded-2xl text-slate-900 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 부서</SelectItem>
                <SelectItem value="영업제1추진부">영업제1추진부</SelectItem>
                <SelectItem value="영업제2추진부">영업제2추진부</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 🏆 1위 하이라이트 카드 */}
          <Card className="lg:col-span-1 border-none shadow-2xl bg-white rounded-[3rem] p-8 lg:p-10 flex flex-col justify-between min-h-[420px] ring-1 ring-slate-100">
            <div className="space-y-6">
              <div className="h-16 w-16 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-500">
                <Flame className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Leader</p>
                <h3 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter italic">{stats[0]?.name || '-'}</h3>
              </div>
            </div>
            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="bg-slate-50 p-6 rounded-[2rem]">
                <p className="text-sm font-black text-blue-600">{stats[0]?.affiliation}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{stats[0]?.group}</p>
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Total Attendance</span>
                <span className="text-4xl font-black text-slate-900">{stats[0]?.count}<span className="text-sm ml-1 opacity-20 italic">Times</span></span>
              </div>
            </div>
          </Card>

          {/* 📑 상세 랭킹 보드 */}
          <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-[3rem] overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/50 border-b p-8">
              <CardTitle className="text-xs font-black flex items-center gap-3 text-slate-400 uppercase tracking-[0.2em]">
                <Target className="h-5 w-5 text-blue-600" /> Member Performance Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto scrollbar-hide">
                {stats.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between p-6 lg:p-8 hover:bg-slate-50/80 transition-all group">
                    <div className="flex items-center gap-6 lg:gap-10">
                      <span className={`text-3xl font-black italic tracking-tighter ${i < 3 ? 'text-blue-600' : 'text-slate-200'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-black text-slate-800 text-lg lg:text-xl group-hover:text-blue-600 transition-colors">{s.name}</p>
                        <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {s.affiliation} · {s.group}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-2xl lg:text-3xl font-black text-slate-900">{s.count}</p>
                      <div className="w-16 lg:w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-1000" 
                          style={{ width: `${(s.count / (stats[0]?.count || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 📱 모바일 하단 내비게이션 바 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-24 bg-white/90 backdrop-blur-xl border-t flex items-center justify-around px-8 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <Link href="/" className="flex flex-col items-center gap-1.5 transition-all active:scale-90">
          <div className="p-3 rounded-2xl text-slate-300">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Home</span>
        </Link>
        <Link href="/analytics" className="flex flex-col items-center gap-1.5 transition-all active:scale-90">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100">
            <BarChart3 className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Rank</span>
        </Link>
      </div>
    </div>
  );
}