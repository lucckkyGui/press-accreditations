
// Auth hook implementation
// Added version identifier to ensure change: v1.0.1

import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Hook that enables any component to subscribe to auth state
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
