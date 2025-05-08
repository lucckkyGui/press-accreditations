
import { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthState } from './useAuthState';
import { useAuthMethods } from './authMethods';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, loading, isAuthenticated } = useAuthState();
  const { signUp, signIn, signOut, resetPassword } = useAuthMethods();

  // Make the context object
  const authContext = {
    user,
    session,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  // Pass the value into the context provider and return the provider component
  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
