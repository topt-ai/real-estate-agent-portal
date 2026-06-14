import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { STORAGE_KEYS } from '../config';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

const DRAFT_KEYS = [STORAGE_KEYS.propertyDraft];

function clearLocalDrafts() {
  for (const k of DRAFT_KEYS) {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (event === 'SIGNED_OUT') {
        clearLocalDrafts();
        // Don't bounce if we're already on a public auth page.
        const path = window.location.pathname;
        const publicPaths = ['/login', '/set-password'];
        if (!publicPaths.includes(path)) {
          const url = new URL(window.location.origin + '/login');
          url.searchParams.set('reason', 'expired');
          window.location.replace(url.toString());
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    clearLocalDrafts();
    await supabase.auth.signOut();
    // onAuthStateChange will fire SIGNED_OUT; if we're on a protected
    // route it will redirect. Force the user to /login regardless.
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
