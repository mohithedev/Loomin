'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started...');

        // Try to extract a session from the URL first (OAuth flow)
        let session = null;
        try {
          const fromUrl = await supabase.auth.getSessionFromUrl();
          session = fromUrl.data?.session ?? null;
          if (fromUrl.error) {
            console.warn('getSessionFromUrl error (might be fine):', fromUrl.error);
          } else {
            console.log('Session extracted from URL:', session);
          }
        } catch (err) {
          console.warn('getSessionFromUrl threw:', err);
        }

        // Fallback to getSession (in case session was saved elsewhere)
        if (!session) {
          const { data: sessData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error('Auth error (getSession):', sessionError);
            setError(sessionError.message);
            setTimeout(() => router.push('/'), 2000);
            return;
          }
          session = sessData.session;
        }

        console.log('Final session value:', session);

        if (session) {
          console.log('User logged in:', session.user);

          // capture debug info for display
          const debugInfo = {
            session,
            user: session.user,
            url: window.location.href,
            timestamp: Date.now(),
          };
          setDebug(debugInfo);

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
            try {
              const { data: created } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: user.id,
                    username: user.email?.split('@')[0],
                    full_name: user.user_metadata?.full_name || '',
                    email: user.email || null,
                  },
                ])
                .select()
                .single();

              console.log('Profile created successfully:', created);
            } catch (err) {
              console.error('Error creating profile:', err);
            }
          }

          // Persist a minimal local user so the app's local flows (Dashboard, local auth) work
          try {
            const localUser = {
              id: user.id,
              email: user.email || null,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
              plan: 'free',
              provider: 'google',
              createdAt: Date.now(),
            };
            window.localStorage.setItem('loomin_current_user', JSON.stringify(localUser));
            console.log('Wrote loomin_current_user to localStorage');
          } catch (err) {
            console.warn('Failed to write local user to localStorage:', err);
          }

          console.log('Prepared debug info, not redirecting immediately to allow inspection.');
          // Wait for user to inspect debug info, then redirect
          // Auto-redirect in 6s as a fallback
          setTimeout(() => {
            router.push('/');
          }, 6000);
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
    <div className="min-h-screen p-8 bg-primary text-primary">
      {!debug ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary">Completing sign in...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Auth Callback Debug</h1>
          <p className="mb-4 text-secondary">You were redirected here after sign-in — review the session details below. You will be redirected to the app automatically in a few seconds.</p>

          <section className="mb-4">
            <h2 className="font-semibold">Session</h2>
            <pre className="p-4 bg-secondary rounded mt-2 overflow-auto">{JSON.stringify(debug.session, null, 2)}</pre>
          </section>

          <section className="mb-4">
            <h2 className="font-semibold">User</h2>
            <pre className="p-4 bg-secondary rounded mt-2 overflow-auto">{JSON.stringify(debug.user, null, 2)}</pre>
          </section>

          <section className="mb-4">
            <h2 className="font-semibold">URL / Timestamp</h2>
            <pre className="p-4 bg-secondary rounded mt-2 overflow-auto">{JSON.stringify({ url: debug.url, timestamp: new Date(debug.timestamp).toString() }, null, 2)}</pre>
          </section>

          <div className="flex gap-3">
            <button onClick={() => router.push('/')} className="px-4 py-2 bg-accent text-white rounded">Proceed to app now</button>
            <a href="/debug" className="px-4 py-2 bg-secondary rounded border border-primary">Open /debug page</a>
          </div>
        </div>
      )}
    </div>
  );
}
