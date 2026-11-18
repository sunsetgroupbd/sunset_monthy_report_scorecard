'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/types/scorecard';
import { fetchCurrentUserProfile, getDevToken } from '@/lib/api/scorecard';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loginWithPassword: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadUserProfile = async () => {
    try {
      const p = await fetchCurrentUserProfile();
      setProfile(p);
      return p;
    } catch (err) {
      console.warn('Profile fetch error:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (mounted) setUser(session.user);
          await loadUserProfile();
        } else {
          // Check local dev token
          const localToken = typeof window !== 'undefined' ? localStorage.getItem('scorecard_auth_token') : null;
          if (localToken) {
            const p = await loadUserProfile();
            if (p && mounted) {
              setUser({ id: p.id, email: p.email });
            }
          }
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile();
      } else if (!localStorage.getItem('scorecard_auth_token')) {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Protect routes
  useEffect(() => {
    if (loading) return;

    const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
    const isPublic = publicRoutes.some((route) => pathname?.startsWith(route));

    if (!profile && !user && !isPublic) {
      router.push('/login');
    } else if (profile && isPublic) {
      router.push('/manual-scorecard');
    }
  }, [profile, user, loading, pathname, router]);

  const loginWithPassword = async (email: string, password: string) => {
    setLoading(true);
    try {
      // 1. Try Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Fallback to dev token helper if local development
        try {
          const dev = await getDevToken(email);
          localStorage.setItem('scorecard_auth_token', dev.access_token);
          if (typeof document !== 'undefined') {
            document.cookie = `scorecard_auth_token=${dev.access_token}; path=/; max-age=604800; SameSite=Lax`;
          }
          setUser({ id: dev.profile_id, email: dev.email });
          await loadUserProfile();
          router.push('/manual-scorecard');
          return;
        } catch (devErr) {
          throw new Error(error.message);
        }
      }
      setUser(data.user);
      await loadUserProfile();
      router.push('/manual-scorecard');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('scorecard_auth_token');
    if (typeof document !== 'undefined') {
      document.cookie = 'scorecard_auth_token=; path=/; max-age=0; SameSite=Lax';
    }
    setUser(null);
    setProfile(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        loginWithPassword,
        logout,
        refreshProfile: async () => {
          await loadUserProfile();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
