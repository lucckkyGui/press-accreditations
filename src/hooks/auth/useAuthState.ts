
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { AppRole, UserProfile } from './types';

const SESSION_REFRESH_MARGIN_MS = 5 * 60 * 1000; // Refresh 5 min before expiry

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout>>();

  const scheduleRefresh = useCallback((sess: Session | null) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    if (!sess?.expires_at) return;

    const expiresAt = sess.expires_at * 1000;
    const refreshIn = expiresAt - Date.now() - SESSION_REFRESH_MARGIN_MS;

    if (refreshIn <= 0) {
      // Already close to expiry, refresh now
      supabase.auth.refreshSession();
      return;
    }

    refreshTimer.current = setTimeout(() => {
      supabase.auth.refreshSession();
    }, refreshIn);
  }, []);

  const fetchUserData = useCallback(async (userId: string, userEmail: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, phone, organization_name')
      .eq('id', userId)
      .single();

    if (profileData) {
      setProfile({
        id: profileData.id,
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        email: userEmail,
        avatarUrl: profileData.avatar_url || undefined,
        phone: profileData.phone || undefined,
        organizationName: profileData.organization_name || undefined,
      });
    }

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (rolesData && rolesData.length > 0) {
      setRoles(rolesData.map(r => r.role as AppRole));
    } else {
      setRoles(['guest']);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsAuthenticated(!!newSession);
        scheduleRefresh(newSession);

        if (newSession?.user) {
          setTimeout(() => {
            fetchUserData(newSession.user.id, newSession.user.email || '');
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setIsAuthenticated(!!existingSession);
      scheduleRefresh(existingSession);

      if (existingSession?.user) {
        fetchUserData(existingSession.user.id, existingSession.user.email || '')
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [fetchUserData, scheduleRefresh]);

  const hasRole = useCallback((role: AppRole) => roles.includes(role), [roles]);
  const isOrganizer = roles.includes('organizer') || roles.includes('admin');
  const isAdmin = roles.includes('admin');

  return {
    user,
    session,
    profile,
    roles,
    loading,
    isLoading: loading,
    isAuthenticated,
    isOrganizer,
    isAdmin,
    hasRole,
  };
};
