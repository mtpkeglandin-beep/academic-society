export interface Event {
  id: string;
  created_at: string;
  product: 'EGL' | 'HER' | 'NOV' | 'RAD' | 'UPL' | 'VAD';
  event_name: string;
  organizer: string;
  location: string;
  start_date: string;
  end_date: string; // 👈 이 줄이 추가되어 빌드 에러를 해결합니다.
  pm_attend: boolean;
  attendees: string[];
}