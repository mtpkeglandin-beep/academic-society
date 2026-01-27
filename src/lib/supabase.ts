import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 변수가 비어있는지 먼저 체크합니다.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL 또는 Anon Key가 .env.local에 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);