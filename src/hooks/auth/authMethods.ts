
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthData } from './types';

export const signUp = async (data: AuthData) => {
  try {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role || 'guest'
        }
      }
    });

    if (error) throw error;

    toast.success('Verification link sent to your email');
    return { error: null };
  } catch (error: Error | unknown) {
    toast.error(error.message);
    return { error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    toast.success('Signed in successfully');
    return { error: null };
  } catch (error: Error | unknown) {
    toast.error(error.message);
    return { error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast.success('Signed out successfully');
  } catch (error: Error | unknown) {
    toast.error(error.message);
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    toast.success('Password reset link sent to your email');
    return { error: null };
  } catch (error: Error | unknown) {
    toast.error(error.message);
    return { error };
  }
};
