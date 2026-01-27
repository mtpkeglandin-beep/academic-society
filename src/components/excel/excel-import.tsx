'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { FileUp, Loader2 } from 'lucide-react';

export default function ExcelImport({ onShowSuccess }: { onShowSuccess: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // 🛡️ 엑셀 날짜 형식을 시스템용(YYYY-MM-DD)으로 변환하는 함수
  const formatExcelDate = (value: any) => {
    if (!value) return '';
    
    // 1. 이미 Date 객체인 경우 (cellDates: true 설정 시 발생)
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    // 2. 엑셀 일련번호(숫자)인 경우 (예: 46101)
    if (typeof value === 'number') {
      // 엑셀 날짜(1900-01-01 기준)를 JS 날짜(1970-01-01 기준)로 변환
      const d = new Date(Math.round((value - 25569) * 86400 * 1000));
      return d.toISOString().split('T')[0];
    }

    // 3. 문자열인 경우 (2026.03.20 -> 2026-03-20)
    const strDate = String(value).trim().replaceAll('.', '-');
    
    // YYYY-MM-DD 형식 검증
    if (/^\d{4}-\d{2}-\d{2}$/.test(strDate)) {
      return strDate;
    }
    
    return strDate;
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        // cellDates: true를 설정하여 라이브러리가 1차적으로 날짜 변환을 시도하게 함
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (rawRows.length === 0) throw new Error("파일에 데이터가 없습니다.");

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
            pm_attend: pmAttend,
            attendees: []
          };
        }).filter(row => row !== null);

        const { error } = await supabase.from('events').insert(cleansedData);
        if (error) throw error;

        alert(`${cleansedData.length}건의 일정이 등록되었습니다.`);
        onShowSuccess();
      } catch (err: any) {
        console.error('Import Error:', err);
        alert(`업로드 실패: ${err.message || '파일 내용을 확인해 주세요.'}`);
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
        className="border-slate-200 hover:bg-slate-50 font-black text-xs h-10 lg:h-12 rounded-xl px-4 lg:px-6 transition-all active:scale-95 shadow-sm"
      >
        {isImporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-600" />
        ) : (
          <FileUp className="h-4 w-4 mr-2 text-blue-600" />
        )}
        <span className="hidden sm:inline">엑셀 가져오기</span>
      </Button>
    </>
  );
}