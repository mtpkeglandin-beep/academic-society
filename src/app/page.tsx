'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, BarChart3, CalendarDays, TableProperties } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { Event } from '@/types/database';

import CalendarView from '@/components/calendar/calendar-view';
import EventTable from '@/components/table/event-table';
import EventModal from '@/components/calendar/event-modal';
import ExcelImport from '@/components/excel/excel-import';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('start_date', { ascending: true });
    if (data) setEvents(data as Event[]);
  };

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter(ev => ev.start_date === selectedDate);
  }, [events, selectedDate]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setActiveTab('table');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-24 lg:pb-0">
      {/* 상단 헤더: 데스크톱/모바일 공통 */}
      <header className="sticky top-0 z-50 w-full border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 lg:h-20 flex justify-between items-center">
          <div className="flex items-center gap-6 lg:gap-10">
            <div className="flex flex-col">
              <span className="text-xl lg:text-2xl font-black tracking-tighter text-slate-900 italic">EGLANDIN</span>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none">Schedule Hub</span>
            </div>
            {/* 데스크톱 메뉴 */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl">
              <Link href="/" className={`px-5 py-2 rounded-lg text-sm font-black transition-all ${pathname === '/' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>대시보드</Link>
              <Link href="/analytics" className={`px-5 py-2 rounded-lg text-sm font-black transition-all ${pathname === '/analytics' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>참석자 횟수 분석</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            <ExcelImport onShowSuccess={fetchEvents} />
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl h-10 lg:h-12 px-4 lg:px-6 shadow-lg shadow-blue-100 transition-all active:scale-95">
              <Plus className="h-5 w-5 lg:mr-2" />
              <span className="hidden lg:inline text-sm">학회 등록</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 lg:space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Schedule</h2>
              <p className="text-xs lg:text-base text-slate-500 font-bold">
                {selectedDate ? `📅 ${selectedDate} 필터링 결과` : '영업부 학회 지원 현황입니다.'}
              </p>
            </div>
            
            <TabsList className="grid grid-cols-2 w-full lg:w-[320px] bg-white p-1 rounded-2xl h-12 lg:h-14 shadow-sm border border-slate-200">
              <TabsTrigger value="calendar" className="rounded-xl font-black text-xs lg:text-sm transition-all">
                <CalendarDays className="h-4 w-4 mr-2" /> 캘린더
              </TabsTrigger>
              <TabsTrigger value="table" className="rounded-xl font-black text-xs lg:text-sm transition-all">
                <TableProperties className="h-4 w-4 mr-2" /> 리스트
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="calendar" className="focus-visible:outline-none">
            <Card className="border-none shadow-xl rounded-[2rem] lg:rounded-[3.5rem] overflow-hidden bg-white p-2 lg:p-8">
              <CalendarView events={events} onDateClick={handleDateClick} />
            </Card>
          </TabsContent>

          <TabsContent value="table" className="focus-visible:outline-none">
            <EventTable events={filteredEvents} onUpdate={fetchEvents} />
          </TabsContent>
        </Tabs>
      </main>

      {/* 📱 모바일 하단 내비게이션 바 (참석자 횟수 분석 포함) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t flex items-center justify-around px-8 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <Link href="/" className="flex flex-col items-center gap-1.5">
          <LayoutDashboard className={`h-6 w-6 ${pathname === '/' ? 'text-blue-600' : 'text-slate-300'}`} />
          <span className={`text-[10px] font-black uppercase ${pathname === '/' ? 'text-blue-600' : 'text-slate-300'}`}>대시보드</span>
        </Link>
        <Link href="/analytics" className="flex flex-col items-center gap-1.5">
          <BarChart3 className={`h-6 w-6 ${pathname === '/analytics' ? 'text-blue-600' : 'text-slate-300'}`} />
          <span className={`text-[10px] font-black uppercase ${pathname === '/analytics' ? 'text-blue-600' : 'text-slate-300'}`}>참석 분석</span>
        </Link>
      </div>

      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchEvents} />
    </div>
  );
}