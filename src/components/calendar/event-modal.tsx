'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { X, Calendar as CalendarIcon, MapPin, UserCheck, LayoutGrid, Info } from 'lucide-react';

export default function EventModal({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [formData, setFormData] = useState({
    product: 'EGL',
    event_name: '',
    organizer: '',
    location: '',
    start_date: '',
    end_date: '',
    booth_size: '1', // 부스 규모 (기본 1부스)
    pm_attend: false,
    attendees: [] as string[]
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submissionData = { 
        ...formData, 
        end_date: formData.end_date || formData.start_date,
        booth_size: parseInt(formData.booth_size), // 정수 변환 저장
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase.from('events').insert([submissionData]);
      if (error) throw error;
      
      alert('TPKR 학회 일정이 등록되었습니다.');
      onSuccess();
      onClose();
      setFormData({ product: 'EGL', event_name: '', organizer: '', location: '', start_date: '', end_date: '', booth_size: '1', pm_attend: false, attendees: [] });
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden p-8 space-y-6 animate-in zoom-in duration-300 ring-1 ring-white/20">
        <div className="flex justify-between items-center text-slate-900 border-b pb-6">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-blue-600">Register Event</h2>
            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">TPKR Academic Society Scheduler</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 ml-2 uppercase flex items-center gap-1">
                <Info className="h-3 w-3" /> 제품군
              </label>
              <select className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner" value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})}>
                {['EGL', 'HER', 'NOV', 'RAD', 'UPL', 'VAD'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 ml-2 uppercase flex items-center gap-1">
                <LayoutGrid className="h-3 w-3" /> 부스 규모
              </label>
              <select className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner" value={formData.booth_size} onChange={(e) => setFormData({...formData, booth_size: e.target.value})}>
                {[1, 2, 3, 4].map(size => <option key={size} value={size}>{size} 부스</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">학회명</label>
            <input required placeholder="정식 명칭 입력" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 shadow-inner" value={formData.event_name} onChange={(e) => setFormData({...formData, event_name: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-slate-900">
              <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">주관기관</label>
              <input placeholder="주관 단체" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm shadow-inner" value={formData.organizer} onChange={(e) => setFormData({...formData, organizer: e.target.value})} />
            </div>
            <div className="space-y-1.5 text-slate-900">
              <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">개최 장소</label>
              <input required placeholder="호텔/회관명" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm shadow-inner" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-slate-900">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 ml-2 uppercase italic">Start Date</label>
              <input type="date" required className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-xs shadow-inner" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 ml-2 uppercase italic">End Date</label>
              <input type="date" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-xs shadow-inner" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button 
              type="button" 
              onClick={() => setFormData({...formData, pm_attend: !formData.pm_attend})} 
              className={`flex-1 rounded-2xl h-14 font-black transition-all border-2 ${formData.pm_attend ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-300 border-slate-100 hover:border-slate-200'}`}
            >
              <UserCheck className="h-5 w-5 mr-2" /> PM 참석
            </Button>
            <Button type="submit" className="flex-[2] bg-slate-900 hover:bg-black text-white font-black h-14 rounded-2xl text-lg shadow-xl active:scale-95 transition-all uppercase italic tracking-tighter">Save Event</Button>
          </div>
        </form>
      </div>
    </div>
  );
}