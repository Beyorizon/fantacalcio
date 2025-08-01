import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://smxrzjilngbiggrhetkz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNteHJ6amlsbmdiaWdncmhldGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjYxMTcsImV4cCI6MjA2OTY0MjExN30.nmmSYAdklaiTVMVp2yNkSuJre26FRFow5qhkgxsRDz4'
export const supabase = createClient(supabaseUrl, supabaseKey)
