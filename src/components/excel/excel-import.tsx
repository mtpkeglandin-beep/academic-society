'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { FileUp, Loader2, AlertCircle } from 'lucide-react';

export default function ExcelImport({ onShowSuccess }: { onShowSuccess: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // 🛡️ 엑셀의 온갖 날짜 형식을 시스템용(YYYY-MM-DD)으로 바꾸는 마법의 함수
  const formatExcelDate = (value: any) => {
    if (!value) return '';
    
    // 1. 이미 Date 객체인 경우
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    // 2. 엑셀 일련번호(숫자)인 경우 (예: 46101)
    if (typeof value === 'number') {
      const date = XLSX.utils.format_date(XLSX.utils.parse_date(value));
      const d = new Date(value > 10000 ? (value - 25569) * 86400 * 1000 : value);
      return d.toISOString().split('T')[0];
    }

    // 3. 문자열인 경우 (2026.03.20 -> 2026-03-20)
    let strDate = String(value).trim().replaceAll('.', '-');
    
    // 날짜 형식이 유효한지 확인 (YYYY-MM-DD 포맷인지)
    if (/^\d{4}-\d{2}-\d{2}$/.test(strDate)) {
      return strDate;
    }
    
    return strDate; // 일단 반환 후 DB 에러 체크에 맡김
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
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 빈 줄을 제외하고 데이터를 가져옵니다.
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (rawRows.length === 0) {
          throw new Error("엑셀 파일에 데이터가 없습니다.");
        }

        // 🛠️ 데이터 최종 정밀 세척
        const cleansedData = rawRows.map((row: any) => {
          // 필수 항목이 비어있는 행은 건너뛰기 위해 필터링 필요할 수 있음
          if (!row.product || !row.event_name) return null;

          const startDate = formatExcelDate(row.start_date);
          const endDate = formatExcelDate(row.end_date) || startDate;
          
          // pm_attend 유연하게 처리
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
        }).filter(row => row !== null); // 실제 데이터가 있는 행만 남김

        const { error } = await supabase.from('events').insert(cleansedData);
        if (error) throw error;

        alert(`${cleansedData.length}건의 학회 일정이 등록되었습니다.`);
        onShowSuccess();
      } catch (err: any) {
        console.error('Import Error Detail:', err);
        alert(`업로드 실패: ${err.message || '파일 내용을 다시 확인해 주세요.'}`);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file); // Binary보다 안전한 ArrayBuffer 사용
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