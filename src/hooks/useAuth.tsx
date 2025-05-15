
// Central re-export file for authentication functionality
// Version: v1.0.2

// Direct export from auth folder - avoiding circular imports
import { useAuth } from './auth/useAuth';
export { useAuth };

// Re-export everything else from the auth folder
export * from './auth';
