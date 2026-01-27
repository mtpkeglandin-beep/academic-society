export interface Event {
  id: string;
  created_at: string;
  product: 'EGL' | 'HER' | 'NOV' | 'RAD' | 'VAD' | 'UPL';
  event_name: string;
  organizer: string;
  location: string;
  start_date: string;
  pm_attend: boolean;
  attendees: string[];
}