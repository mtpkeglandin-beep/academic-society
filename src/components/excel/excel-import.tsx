'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { FileUp, Loader2, AlertCircle } from 'lucide-react';

export default function ExcelImport({ onShowSuccess }: { onShowSuccess: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const formatExcelDate = (value: any) => {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString().split('T')[0];
    if (typeof value === 'number') {
      const d = new Date(Math.round((value - 25569) * 86400 * 1000));
      return d.toISOString().split('T')[0];
    }
    const strDate = String(value).trim().replaceAll('.', '-');
    return /^\d{4}-\d{2}-\d{2}$/.test(strDate) ? strDate : strDate;
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (rawRows.length === 0) throw new Error("엑셀 파일에 데이터가 없습니다.");

        const cleansedData = rawRows.map((row: any) => {
          if (!row.product || !row.event_name) return null;

          const startDate = formatExcelDate(row.start_date);
          const endDate = formatExcelDate(row.end_date) || startDate;
          
          const pmAttendValue = String(row.pm_attend).toLowerCase();
          const pmAttend = row.pm_attend === 1 || row.pm_attend === '1' || pmAttendValue === 'true' || pmAttendValue === 'y';

          return {
            product: String(row.product).trim().toUpperCase(),
            event_name: String(row.event_name).trim(),
            organizer: String(row.organizer || '').trim(),
            location: String(row.location || '').trim(),
            start_date: startDate,
            end_date: endDate,
            // booth_size 컬럼 파싱 (없으면 1 기본값)
            booth_size: parseInt(row.booth_size) || 1,
            pm_attend: pmAttend,
            attendees: []
          };
        }).filter(row => row !== null);

        const { error } = await supabase.from('events').insert(cleansedData);
        if (error) throw error;

        alert(`TPKR 영업본부용 ${cleansedData.length}건의 일정이 일괄 등록되었습니다.`);
        onShowSuccess();
      } catch (err: any) {
        alert(`업로드 실패: 데이터 형식을 다시 확인해주세요.`);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleImport} accept=".xlsx, .xls" className="hidden" />
      <Button 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="border-slate-200 hover:bg-slate-50 font-black text-xs h-10 lg:h-12 rounded-xl px-4 lg:px-6 transition-all active:scale-95 shadow-sm bg-white"
      >
        {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-600" /> : <FileUp className="h-4 w-4 mr-2 text-blue-600" />}
        <span className="hidden sm:inline">대량 업로드</span>
      </Button>
    </>
  );
}