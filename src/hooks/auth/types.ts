
import { Session, User } from "@supabase/supabase-js";

export interface AuthData {
  first_name?: string;
  last_name?: string;
  email: string;
  password: string;
  role?: 'admin' | 'organizer' | 'staff' | 'guest';
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (data: AuthData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}
