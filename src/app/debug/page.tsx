"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [storage, setStorage] = useState<Record<string, any>>({});
  const [env, setEnv] = useState<Record<string, string>>({});

  const refresh = async () => {
    try {
      const { data: sessData } = await supabase.auth.getSession();
      setSession(sessData.session ?? null);
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user ?? null);
    } catch (err: any) {
      setSession({ error: String(err) });
    }

    const items: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || '';
      try {
        items[key] = JSON.parse(localStorage.getItem(key) || 'null');
      } catch {
        items[key] = localStorage.getItem(key);
      }
    }
    setStorage(items);

    setEnv({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_YOUTUBE_API_KEY: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ? 'SET' : 'MISSING',
    });
  };

  useEffect(() => {
    refresh();
    // Also listen for auth changes to update UI
    const sub = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => sub.data?.subscription?.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-primary text-primary">
      <h1 className="text-2xl font-bold mb-4">Debug: Auth & Environment</h1>
      <div className="mb-4">
        <button onClick={refresh} className="px-4 py-2 bg-accent text-white rounded">Refresh</button>
      </div>

      <section className="mb-6">
        <h2 className="font-semibold">Session</h2>
        <pre className="p-4 bg-secondary rounded mt-2 overflow-auto max-h-48">{JSON.stringify(session, null, 2)}</pre>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">User</h2>
        <pre className="p-4 bg-secondary rounded mt-2 overflow-auto max-h-48">{JSON.stringify(user, null, 2)}</pre>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">LocalStorage</h2>
        <pre className="p-4 bg-secondary rounded mt-2 overflow-auto max-h-72">{JSON.stringify(storage, null, 2)}</pre>
      </section>

      <section>
        <h2 className="font-semibold">Env (presence only)</h2>
        <pre className="p-4 bg-secondary rounded mt-2">{JSON.stringify(env, null, 2)}</pre>
      </section>
    </div>
  );
}
