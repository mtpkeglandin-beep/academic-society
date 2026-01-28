export interface Event {
  id: string;
  created_at: string;
  product: string;
  event_name: string;
  organizer: string;
  location: string;
  start_date: string;
  end_date: string;
  pm_attend: boolean;
  attendees: string[];
  // 🔴 이 줄을 추가하여 TypeScript에게 booth_size의 존재를 알립니다.
  booth_size: number; 
}