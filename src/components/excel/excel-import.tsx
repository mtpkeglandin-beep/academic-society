'use client';

import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";

// 기본 내보내기(default export) 사용
export default function ExcelImport({ onShowSuccess }: { onShowSuccess: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const formattedData = jsonData.map((row: any) => ({
          product: row['제품'],
          event_name: row['학회명'],
          organizer: row['주관학회'] || '',
          location: row['장소'],
          start_date: row['시작일'],
          end_date: row['종료일'] || row['시작일'],
          required_headcount: parseInt(row['필요인원'] || '0'),
          notes: row['비고'] || '',
          attendees: row['MR 참석 예정자'] ? row['MR 참석 예정자'].toString().split(',').map((s: string) => s.trim()) : [],
          pm_attend: row['PM 참석 여부'] === 'Y'
        }));

        const { error } = await supabase.from('events').upsert(formattedData, { onConflict: 'event_name,start_date,location' });
        if (error) throw error;
        
        alert('데이터를 성공적으로 가져왔습니다!');
        onShowSuccess();
      } catch (err) {
        alert('가져오기 실패. 엑셀 형식을 확인하세요.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      <Button variant="outline" className="gap-2 font-bold" onClick={() => fileInputRef.current?.click()}>
        <FileUp className="h-4 w-4" /> EXCEL 가져오기
      </Button>
    </>
  );
}