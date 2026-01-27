'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  LayoutDashboard, 
  BarChart3, 
  CalendarDays, 
  TableProperties, 
  FilterX, 
  Loader2, 
  CalendarCheck, 
  Users, 
  ChevronRight,
  Filter
} from "lucide-react";
import { supabase } from '@/lib/supabase';
import { Event } from '@/types/database';
import { isWithinInterval, parseISO, getYear, getMonth, format } from 'date-fns';

import CalendarView from '@/components/calendar/calendar-view';
import EventTable from '@/components/table/event-table';
import EventModal from '@/components/calendar/event-modal';
import ExcelImport from '@/components/excel/excel-import';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔍 신규 필터 상태
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [filterProduct, setFilterProduct] = useState<string>('all');

  const pathname = usePathname();

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('events').select('*').order('start_date', { ascending: true });
      if (error) throw error;
      if (data) setEvents(data as Event[]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // 🔍 지능형 다중 필터링 로직
  const filteredEvents = useMemo(() => {
    // 1. 캘린더에서 날짜를 찍어서 넘어온 경우 (최우선순위)
    if (selectedDate && activeTab === 'table') {
      const target = parseISO(selectedDate);
      return events.filter(ev => {
        const start = parseISO(ev.start_date);
        const end = parseISO(ev.end_date || ev.start_date);
        return isWithinInterval(target, { start, end });
      });
    }

    // 2. 리스트 탭 전용 연도/월/품목 필터링
    return events.filter(ev => {
      const start = parseISO(ev.start_date);
      const evYear = getYear(start).toString();
      const evMonth = (getMonth(start) + 1).toString();

      const matchYear = filterYear === 'all' || evYear === filterYear;
      const matchMonth = filterMonth === 'all' || evMonth === filterMonth;
      const matchProduct = filterProduct === 'all' || ev.product === filterProduct;

      return matchYear && matchMonth && matchProduct;
    });
  }, [events, selectedDate, activeTab, filterYear, filterMonth, filterProduct]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: events.length,
      upcoming: events.filter(e => (e.end_date || e.start_date) >= today).length,
      pmParticipation: events.filter(e => e.pm_attend).length
    };
  }, [events]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setActiveTab('table');
    setTimeout(() => {
      document.getElementById('event-content')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-24 lg:pb-12 font-sans text-slate-900">
      <header className="sticky top-0 z-50 w-full border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 lg:h-20 flex justify-between items-center text-slate-900">
          <Link href="/" className="flex flex-col group">
            <span className="text-xl lg:text-3xl font-black tracking-tighter italic group-hover:text-blue-600 transition-all">EGLANDIN</span>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] leading-none">Schedule Hub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 bg-slate-200/50 p-1.5 rounded-2xl">
            <Link href="/" className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${pathname === '/' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>대시보드</Link>
            <Link href="/analytics" className="px-6 py-2 rounded-xl text-sm font-black text-slate-500 hover:text-slate-900 transition-all">참석자 횟수 분석</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ExcelImport onShowSuccess={fetchEvents} />
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl h-10 lg:h-14 px-4 lg:px-8 shadow-xl shadow-blue-100 transition-all active:scale-95 flex gap-2">
              <Plus className="h-5 w-5" /><span className="hidden sm:inline text-sm">학회 등록</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-10">
        {/* 📊 퀵 통계 바 */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6 flex items-center gap-4 text-slate-900">
            <div className="p-3 bg-blue-50 rounded-2xl"><CalendarCheck className="h-6 w-6 text-blue-600" /></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">전체 지원</p><p className="text-xl font-black">{stats.total} 건</p></div>
          </Card>
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6 flex items-center gap-4 text-slate-900">
            <div className="p-3 bg-green-50 rounded-2xl"><ChevronRight className="h-6 w-6 text-green-600" /></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">진행 예정</p><p className="text-xl font-black">{stats.upcoming} 건</p></div>
          </Card>
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6 flex items-center gap-4 text-slate-900">
            <div className="p-3 bg-violet-50 rounded-2xl"><Users className="h-6 w-6 text-violet-600" /></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">PM 참석</p><p className="text-xl font-black">{stats.pmParticipation} 건</p></div>
          </Card>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 lg:space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Schedule</h2>
                {isLoading && <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm lg:text-lg text-slate-500 font-bold">
                  {selectedDate ? (
                    <span className="text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full italic font-black animate-in zoom-in">📅 {selectedDate} 일정 필터링 중</span>
                  ) : '영업부 통합 학회 지원 현황입니다.'}
                </p>
                {(selectedDate || filterProduct !== 'all' || filterMonth !== 'all') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setSelectedDate(null); setFilterProduct('all'); setFilterMonth((new Date().getMonth() + 1).toString()); }} 
                    className="h-8 text-red-500 font-black gap-1 hover:bg-red-50 rounded-full border border-red-100"
                  >
                    <FilterX className="h-3 w-3" /> 필터 해제
                  </Button>
                )}
              </div>
            </div>
            
            <TabsList className="grid grid-cols-2 w-full lg:w-[340px] bg-white p-1.5 rounded-[1.5rem] h-14 lg:h-16 shadow-xl border border-slate-200">
              <TabsTrigger value="calendar" className="rounded-xl font-black text-xs lg:text-sm transition-all flex gap-2 text-slate-900 tracking-tighter"><CalendarDays className="h-4 w-4" /> 캘린더</TabsTrigger>
              <TabsTrigger value="table" className="rounded-xl font-black text-xs lg:text-sm transition-all flex gap-2 text-slate-900 tracking-tighter"><TableProperties className="h-4 w-4" /> 리스트</TabsTrigger>
            </TabsList>
          </div>

          {/* 🔍 리스트 탭 전용 필터 바 (고급 디자인) */}
          {activeTab === 'table' && !selectedDate && (
            <div className="flex flex-wrap gap-3 bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] border border-white/40 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-2 px-3 text-slate-400"><Filter className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Filters</span></div>
              
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[120px] bg-white border-none rounded-xl font-bold shadow-sm h-11 focus:ring-2 focus:ring-blue-500"><SelectValue placeholder="연도" /></SelectTrigger>
                <SelectContent><SelectItem value="2025">2025년</SelectItem><SelectItem value="2026">2026년</SelectItem><SelectItem value="2027">2027년</SelectItem></SelectContent>
              </Select>

              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-[110px] bg-white border-none rounded-xl font-bold shadow-sm h-11 focus:ring-2 focus:ring-blue-500"><SelectValue placeholder="월" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 월</SelectItem>
                  {Array.from({length: 12}, (_, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()}>{i+1}월</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterProduct} onValueChange={setFilterProduct}>
                <SelectTrigger className="w-[140px] bg-white border-none rounded-xl font-bold shadow-sm h-11 focus:ring-2 focus:ring-blue-500"><SelectValue placeholder="품목" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 품목</SelectItem>
                  {['EGL', 'HER', 'NOV', 'RAD', 'UPL', 'VAD'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div id="event-content" className="outline-none m-0">
            <TabsContent value="calendar" className="m-0"><Card className="border-none shadow-2xl rounded-[3rem] lg:rounded-[4rem] overflow-hidden bg-white p-2 lg:p-10 ring-1 ring-slate-100"><CalendarView events={events} onDateClick={handleDateClick} /></Card></TabsContent>
            <TabsContent value="table" className="m-0"><EventTable events={filteredEvents} onUpdate={fetchEvents} /></TabsContent>
          </div>
        </Tabs>
      </main>

      {/* 📱 모바일 하단바 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-24 bg-white/90 backdrop-blur-xl border-t flex items-center justify-around px-8 z-50">
        <Link href="/" className="flex flex-col items-center gap-1.5 transition-all"><div className={`p-3 rounded-2xl ${pathname === '/' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-300'}`}><LayoutDashboard className="h-6 w-6" /></div><span className={`text-[10px] font-black uppercase ${pathname === '/' ? 'text-blue-600' : 'text-slate-300'}`}>Home</span></Link>
        <Link href="/analytics" className="flex flex-col items-center gap-1.5 transition-all"><div className={`p-3 rounded-2xl ${pathname === '/analytics' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300'}`}><BarChart3 className="h-6 w-6" /></div><span className={`text-[10px] font-black uppercase ${pathname === '/analytics' ? 'text-blue-600' : 'text-slate-300'}`}>Rank</span></Link>
      </div>

      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchEvents} />
    </div>
  );
}