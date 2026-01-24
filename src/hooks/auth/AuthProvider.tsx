import { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthState } from './useAuthState';
import { signUp, signIn, signOut, resetPassword } from './authMethods';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { 
    user, 
    session, 
    profile,
    roles,
    loading, 
    isLoading, 
    isAuthenticated,
    isOrganizer,
    isAdmin,
    hasRole,
  } = useAuthState();

  const authContext = {
    user,
    session,
    profile,
    roles,
    loading,
    isLoading,
    isAuthenticated,
    isOrganizer,
    isAdmin,
    hasRole,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
