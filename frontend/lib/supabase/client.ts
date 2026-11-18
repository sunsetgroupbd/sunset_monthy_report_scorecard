import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cdigidyfpjqlalnsacxp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ALI35DxSGdo0oWvHNbP7wA_jPXgC0am';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
