import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { AppRole, UserProfile } from './types';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUserData = useCallback(async (userId: string, userEmail: string) => {
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', userId)
      .single();

    if (profileData) {
      setProfile({
        id: profileData.id,
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        email: userEmail,
        avatarUrl: profileData.avatar_url || undefined,
      });
    }

    // Fetch roles from user_roles table
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsAuthenticated(!!newSession);

        // Defer profile/roles fetch to avoid deadlock
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

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setIsAuthenticated(!!existingSession);

      if (existingSession?.user) {
        fetchUserData(existingSession.user.id, existingSession.user.email || '')
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

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
