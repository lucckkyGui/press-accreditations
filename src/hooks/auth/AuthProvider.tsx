
import { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthState } from './useAuthState';
import { signUp, signIn, signOut, resetPassword } from './authMethods';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, loading, isLoading, isAuthenticated } = useAuthState();

  const authContext = {
    user,
    session,
    loading,
    isLoading,
    isAuthenticated,
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
