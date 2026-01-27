'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { X, Calendar as CalendarIcon, MapPin, Building, UserCheck } from 'lucide-react';

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
    pm_attend: false,
    attendees: [] as string[]
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('events').insert([formData]);
      if (error) throw error;
      
      alert('학회 일정이 성공적으로 등록되었습니다.');
      onSuccess();
      onClose();
      setFormData({ product: 'EGL', event_name: '', organizer: '', location: '', start_date: '', pm_attend: false, attendees: [] });
    } catch (err) {
      console.error(err);
      alert('등록 오류가 발생했습니다. 필드 값을 확인하세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">New Society Event</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">제품 선택</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700"
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                >
                  {['EGL', 'HER', 'NOV', 'RAD', 'VAD', 'UPL'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PM 참석 여부</label>
                <div 
                  onClick={() => setFormData({...formData, pm_attend: !formData.pm_attend})}
                  className={`w-full rounded-2xl p-4 font-bold flex items-center justify-center cursor-pointer transition-all ${formData.pm_attend ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}
                >
                  <UserCheck className="h-4 w-4 mr-2" /> {formData.pm_attend ? '참석' : '미참석'}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">학회명</label>
              <div className="relative">
                <input required placeholder="학회 정식 명칭" className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 font-bold" value={formData.event_name} onChange={(e) => setFormData({...formData, event_name: e.target.value})} />
                <CalendarIcon className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">주관학회</label>
                <div className="relative">
                  <input required placeholder="주관기관" className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 font-bold" value={formData.organizer} onChange={(e) => setFormData({...formData, organizer: e.target.value})} />
                  <Building className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">장소</label>
                <div className="relative">
                  <input required placeholder="상세 장소" className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 font-bold" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                  <MapPin className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">개최 날짜</label>
              <input type="date" required className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-16 rounded-2xl text-lg shadow-xl shadow-blue-100 transition-all active:scale-95">
              등록 완료
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}