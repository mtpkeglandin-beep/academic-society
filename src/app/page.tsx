'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  LayoutDashboard, 
  BarChart3, 
  CalendarDays, 
  TableProperties, 
  FilterX, 
  CalendarCheck,
  Users,
  Loader2,
  ChevronRight
} from "lucide-react";
import { supabase } from '@/lib/supabase';
import { Event } from '@/types/database';

import CalendarView from '@/components/calendar/calendar-view';
import EventTable from '@/components/table/event-table';
import EventModal from '@/components/calendar/event-modal';
import ExcelImport from '@/components/excel/excel-import';

export default function HomePage() {
  // --- [상태 관리] ---
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // 데이터 페칭 함수 (useCallback으로 메모이제이션하여 성능 최적화)
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      if (data) setEvents(data as Event[]);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // --- [데이터 계산] ---
  const filteredEvents = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter(ev => ev.start_date === selectedDate);
  }, [events, selectedDate]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: events.length,
      upcoming: events.filter(e => e.start_date >= today).length,
      pmParticipation: events.filter(e => e.pm_attend).length
    };
  }, [events]);

  // --- [이벤트 핸들러] ---
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setActiveTab('table');
    setTimeout(() => {
      document.getElementById('event-content')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const clearFilter = () => {
    setSelectedDate(null);
  };

  const onTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'table' && activeTab === 'calendar' && !selectedDate) {
      setSelectedDate(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-24 lg:pb-12 font-sans">
      {/* 고정 상단 헤더 */}
      <header className="sticky top-0 z-50 w-full border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 lg:h-20 flex justify-between items-center">
          <div className="flex items-center gap-6 lg:gap-10">
            <Link href="/" className="flex flex-col group">
              <span className="text-xl lg:text-3xl font-black tracking-tighter text-slate-900 italic transition-all group-hover:text-blue-600">
                EGLANDIN
              </span>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] leading-none">
                Schedule Hub
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl">
              <Link href="/" className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${pathname === '/' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>
                대시보드
              </Link>
              <Link href="/analytics" className="px-6 py-2 rounded-xl text-sm font-black text-slate-500 hover:text-slate-900 transition-all">
                참석자 횟수 분석
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <ExcelImport onShowSuccess={fetchEvents} />
            <Button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl h-10 lg:h-14 px-4 lg:px-8 shadow-xl shadow-blue-100 transition-all active:scale-95 flex gap-2"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline text-sm">학회 등록</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8 lg:space-y-12">
        {/* 상단 퀵 통계 바 */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl"><CalendarCheck className="h-6 w-6 text-blue-600" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">전체 학회</p>
              <p className="text-xl font-black text-slate-900">{stats.total} <span className="text-xs opacity-30 italic font-medium">건</span></p>
            </div>
          </Card>
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-2xl"><ChevronRight className="h-6 w-6 text-green-600" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">진행 예정</p>
              <p className="text-xl font-black text-slate-900">{stats.upcoming} <span className="text-xs opacity-30 italic font-medium">건</span></p>
            </div>
          </Card>
          <Card className="border-none shadow-sm rounded-3xl bg-white p-6 flex items-center gap-4">
            <div className="p-3 bg-violet-50 rounded-2xl"><Users className="h-6 w-6 text-violet-600" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">PM 참석 학회</p>
              <p className="text-xl font-black text-slate-900">{stats.pmParticipation} <span className="text-xs opacity-30 italic font-medium">건</span></p>
            </div>
          </Card>
        </section>

        {/* 메인 콘텐츠 탭 영역 */}
        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-8 lg:space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Schedule</h2>
                {isLoading && <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm lg:text-lg text-slate-500 font-bold">
                  {selectedDate ? (
                    <span className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full animate-in slide-in-from-left-2">
                      <CalendarDays className="h-4 w-4" /> {selectedDate} 학회 정보 필터링 중
                    </span>
                  ) : '영업부 학회 지원 현황입니다.'}
                </p>
                {selectedDate && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilter}
                    className="h-8 rounded-full px-3 text-xs font-black text-red-500 hover:bg-red-50 gap-1"
                  >
                    <FilterX className="h-3 w-3" /> 필터 해제
                  </Button>
                )}
              </div>
            </div>
            
            <TabsList className="grid grid-cols-2 w-full lg:w-[360px] bg-white p-1.5 rounded-[1.5rem] h-14 lg:h-16 shadow-xl shadow-slate-200/50 border border-slate-200">
              <TabsTrigger value="calendar" className="rounded-xl font-black text-xs lg:text-sm transition-all flex gap-2">
                <CalendarDays className="h-4 w-4" /> 캘린더
              </TabsTrigger>
              <TabsTrigger value="table" className="rounded-xl font-black text-xs lg:text-sm transition-all flex gap-2">
                <TableProperties className="h-4 w-4" /> 리스트
              </TabsTrigger>
            </TabsList>
          </div>

          <div id="event-content">
            <TabsContent value="calendar" className="focus-visible:outline-none m-0">
              <Card className="border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] lg:rounded-[4rem] overflow-hidden bg-white p-2 lg:p-10 ring-1 ring-slate-100">
                <CalendarView events={events} onDateClick={handleDateClick} />
              </Card>
            </TabsContent>
            <TabsContent value="table" className="focus-visible:outline-none m-0">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <EventTable events={filteredEvents} onUpdate={fetchEvents} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* 모바일 하단 내비게이션 바 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-24 bg-white/90 backdrop-blur-2xl border-t flex items-center justify-around px-8 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <Link href="/" className="flex flex-col items-center gap-1.5 transition-all active:scale-90">
          <div className={`p-3 rounded-2xl ${pathname === '/' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300'}`}>
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${pathname === '/' ? 'text-blue-600' : 'text-slate-300'}`}>대시보드</span>
        </Link>
        <Link href="/analytics" className="flex flex-col items-center gap-1.5 transition-all active:scale-90">
          <div className={`p-3 rounded-2xl ${pathname === '/analytics' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300'}`}>
            <BarChart3 className="h-6 w-6" />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${pathname === '/analytics' ? 'text-blue-600' : 'text-slate-300'}`}>분석</span>
        </Link>
      </div>

      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchEvents} 
      />
    </div>
  );
}