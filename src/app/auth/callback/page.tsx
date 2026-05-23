'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started...');

        // Get the session from the callback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log('Session:', session);
        console.log('Session error:', sessionError);

        if (sessionError) {
          console.error('Auth error:', sessionError);
          setError(sessionError.message);
          setTimeout(() => router.push('/'), 2000);
          return;
        }

        if (session) {
          console.log('User logged in:', session.user);
          
          // Create profile if it doesn't exist
          const user = session.user;
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          console.log('Profile check result:', existingProfile, profileError);

          if (!existingProfile && profileError?.code !== 'PGRST116') {
            // Error other than not found
            console.error('Profile error:', profileError);
          }

          if (!existingProfile) {
            console.log('Creating new profile...');
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  username: user.email?.split('@')[0],
                  full_name: user.user_metadata?.full_name || '',
                },
              ]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
            } else {
              console.log('Profile created successfully');
            }
          }

          console.log('Redirecting to home...');
          // Redirect to home (dashboard will show automatically)
          router.push('/');
        } else {
          console.log('No session found, redirecting to home');
          router.push('/');
        }
      } catch (error: any) {
        console.error('Error in auth callback:', error);
        setError(error.message || 'An error occurred');
        setTimeout(() => router.push('/'), 2000);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-semibold">Error: {error}</p>
          <p className="text-secondary">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-secondary">Completing sign in...</p>
      </div>
    </div>
  );
}
