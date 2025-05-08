
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthData } from './types';
import { useNavigate } from 'react-router-dom';

export const useAuthMethods = () => {
  const navigate = useNavigate();

  const signUp = async (data: AuthData) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role || 'guest'
          }
        }
      });

      if (error) throw error;

      toast.success('Wysłano link weryfikacyjny na podany adres email');
      return { error: null };
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast.success('Zalogowano pomyślnie');
      return { error: null };
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/home'); // Navigate to home instead of login
      toast.success('Wylogowano pomyślnie');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Wysłano link do resetowania hasła na podany adres email');
      return { error: null };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message);
      return { error };
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    resetPassword
  };
};
