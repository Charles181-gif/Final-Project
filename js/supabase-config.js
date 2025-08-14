// Supabase configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2'

const supabaseUrl = 'https://chprzxdpqeheygestfuh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocHJ6eGRwcWVoZXlnZXN0ZnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNDU0MjcsImV4cCI6MjA3MDYyMTQyN30.JdwUx4cbTfJBrkNY8NyJAPdG7mOJqNQ_7SavvGMzDKw'

export const supabase = createClient(supabaseUrl, supabaseKey)