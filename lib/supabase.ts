import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igtarpqocdagorxmtait.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlndGFycHFvY2RhZ29yeG10YWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDE3OTksImV4cCI6MjA5NDc3Nzc5OX0.ZhiEQnMERsfo0SmP8zd1xb3bMtoXT3n_9ZhZZeMC0Zw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
