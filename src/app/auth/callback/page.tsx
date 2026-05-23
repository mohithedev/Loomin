'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the callback
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth error:', error);
          router.push('/');
          return;
        }

        if (session) {
          // Create profile if it doesn't exist
          const user = session.user;
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!existingProfile) {
            await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  username: user.email?.split('@')[0],
                  full_name: user.user_metadata?.full_name || '',
                },
              ]);
          }

          // Redirect to dashboard
          router.push('/');
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-secondary">Completing sign in...</p>
      </div>
    </div>
  );
}
