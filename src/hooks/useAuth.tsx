
// Central re-export file for authentication functionality
// Added version identifier to ensure change: v1.0.1

import { useAuth as useAuthOriginal } from '@/hooks/auth';

// Named export for direct usage
export const useAuth = useAuthOriginal;

// Re-export everything from the auth folder
export * from '@/hooks/auth';
