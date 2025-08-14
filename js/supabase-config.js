// Supabase configuration with fallback
let supabase = null;

try {
  const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
  const supabaseUrl = 'https://chprzxdpqeheygestfuh.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocHJ6eGRwcWVoZXlnZXN0ZnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNDU0MjcsImV4cCI6MjA3MDYyMTQyN30.JdwUx4cbTfJBrkNY8NyJAPdG7mOJqNQ_7SavvGMzDKw';
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.warn('Supabase initialization failed, using fallback auth:', error);
  supabase = {
    auth: {
      signInWithPassword: () => Promise.reject(new Error('Supabase unavailable')),
      signUp: () => Promise.reject(new Error('Supabase unavailable'))
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.reject(new Error('Supabase unavailable'))
        })
      }),
      insert: () => Promise.reject(new Error('Supabase unavailable'))
    })
  };
}

export { supabase };