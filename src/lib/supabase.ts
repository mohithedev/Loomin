import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Missing');

let supabase: any;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables - app will work in local mode only');
  // Create a dummy client that won't break the app
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithOAuth: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ data: null, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => ({ single: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }) }),
      insert: () => ({ select: () => Promise.resolve({ data: null, error: null }) }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
  };
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };
