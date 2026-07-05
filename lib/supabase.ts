import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Sử dụng ở server-side (API routes), tắt persist session để tránh cache trên Vercel Serverless
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
      persistSession: false,
        },
        });