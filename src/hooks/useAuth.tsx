
/**
 * Auth hook re-export file
 * This file provides a central point for accessing authentication functionality
 */

import { useAuth as useAuthHook } from '@/hooks/auth';

// Named export for direct usage
export const useAuth = useAuthHook;

// Re-export everything else from the auth folder
export * from '@/hooks/auth';
