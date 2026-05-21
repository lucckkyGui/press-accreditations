
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
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout>>();
  const userDataRequest = useRef(0);

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

  const resetUserData = useCallback(() => {
    setProfile(null);
    setRoles([]);
    setRolesLoaded(false);
    setUserDataLoaded(false);
  }, []);

  const fetchUserData = useCallback(async (userId: string, userEmail: string, requestId: number) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, phone, organization_name')
        .eq('id', userId)
        .single();

      if (userDataRequest.current !== requestId) return;

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

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (userDataRequest.current !== requestId) return;

      if (rolesError) {
        console.error('[auth] Failed to fetch user roles', {
          userId,
          error: rolesError,
        });
        setRoles([]);
        return;
      }

      const fetchedRoles = (rolesData ?? []).map(r => r.role as AppRole);
      setRoles(fetchedRoles.length > 0 ? fetchedRoles : ['guest']);
    } catch (error) {
      if (userDataRequest.current !== requestId) return;

      console.error('[auth] Failed to fetch user data', {
        userId,
        error,
      });
      setRoles([]);
    } finally {
      if (userDataRequest.current === requestId) {
        setRolesLoaded(true);
        setUserDataLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsAuthenticated(!!newSession);
        scheduleRefresh(newSession);
        setAuthLoading(false);

        if (newSession?.user) {
          const requestId = userDataRequest.current + 1;
          userDataRequest.current = requestId;
          resetUserData();

          setTimeout(() => {
            fetchUserData(newSession.user.id, newSession.user.email || '', requestId);
          }, 0);
        } else {
          userDataRequest.current += 1;
          resetUserData();
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setIsAuthenticated(!!existingSession);
      scheduleRefresh(existingSession);

      if (existingSession?.user) {
        const requestId = userDataRequest.current + 1;
        userDataRequest.current = requestId;
        resetUserData();
        fetchUserData(existingSession.user.id, existingSession.user.email || '', requestId)
          .finally(() => {
            if (userDataRequest.current === requestId) {
              setAuthLoading(false);
            }
          });
      } else {
        userDataRequest.current += 1;
        resetUserData();
        setAuthLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [fetchUserData, resetUserData, scheduleRefresh]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    console.info('[auth] state', {
      userId: user?.id ?? null,
      roles,
      rolesLoaded,
    });
  }, [roles, rolesLoaded, user?.id]);

  const hasRole = useCallback((role: AppRole) => roles.includes(role), [roles]);
  const isOrganizer = roles.includes('organizer') || roles.includes('admin');
  const isAdmin = roles.includes('admin');
  const loading = authLoading || (isAuthenticated && !userDataLoaded);

  return {
    user,
    session,
    profile,
    roles,
    rolesLoaded,
    userDataLoaded,
    loading,
    isLoading: loading,
    isAuthenticated,
    isOrganizer,
    isAdmin,
    hasRole,
  };
};
