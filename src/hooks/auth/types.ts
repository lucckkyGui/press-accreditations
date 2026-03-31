import { Session, User } from "@supabase/supabase-js";

export type AppRole = 'admin' | 'organizer' | 'moderator' | 'staff' | 'user' | 'guest';

export interface AuthData {
  first_name?: string;
  last_name?: string;
  email: string;
  password: string;
  role?: AppRole;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  organizationName?: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: AppRole[];
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOrganizer: boolean;
  isAdmin: boolean;
  hasRole: (role: AppRole) => boolean;
  signUp: (data: AuthData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}
