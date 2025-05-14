
// This is the central re-export file for auth functionality
// It provides a clean import structure for authentication features

import { useAuth as useAuthImplementation } from '@/hooks/auth';

// Named export for direct usage
export const useAuth = useAuthImplementation;

// Re-export everything from the auth folder
export * from '@/hooks/auth';
