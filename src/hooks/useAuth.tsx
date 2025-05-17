
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOrganizer: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isOrganizer: false,
  signIn: async () => {},
  signOut: async () => {},
});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setIsLoading(false);
          return;
        }

        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          role: profile?.role || 'guest',
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          createdAt: profile?.created_at ? new Date(profile.created_at) : new Date()
        };

        setUser(userData);
        setIsAuthenticated(true);
        setIsOrganizer(userData.role === 'organizer');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsOrganizer(false);
      }
      setIsLoading(false);
    };

    fetchSession();

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            setIsLoading(false);
            return;
          }

          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: profile?.role || 'guest',
            firstName: profile?.first_name || '',
            lastName: profile?.last_name || '',
            createdAt: profile?.created_at ? new Date(profile.created_at) : new Date()
          };

          setUser(userData);
          setIsAuthenticated(true);
          setIsOrganizer(userData.role === 'organizer');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setIsOrganizer(false);
      }
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
      throw error;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user?.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      setIsLoading(false);
      return;
    }

    const userData: User = {
      id: data.user.id,
      email: data.user.email || '',
      role: profile?.role || 'guest',
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      createdAt: profile?.created_at ? new Date(profile.created_at) : new Date()
    };

    setUser(userData);
    setIsAuthenticated(true);
    setIsOrganizer(userData.role === 'organizer');
    setIsLoading(false);
  };

  const signOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
    }

    setUser(null);
    setIsAuthenticated(false);
    setIsOrganizer(false);
    setIsLoading(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isOrganizer,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
