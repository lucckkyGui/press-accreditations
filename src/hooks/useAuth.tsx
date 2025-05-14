
import { useAuth as useAuthHook } from '@/hooks/auth';

// Re-export all auth functionality
export const useAuth = useAuthHook;
export * from '@/hooks/auth';
