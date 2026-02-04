import { createClient } from '@supabase/supabase-js'
const DEFAULT_URL = 'https://smxrzjilngbiggrhetkz.supabase.co'
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNteHJ6amlsbmdiaWdncmhldGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjYxMTcsImV4cCI6MjA2OTY0MjExN30.nmmSYAdklaiTVMVp2yNkSuJre26FRFow5qhkgxsRDz4'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || DEFAULT_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)
