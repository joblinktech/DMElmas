import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'] | null;

interface SupabaseContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  createUserProfile: (profile: Omit<Database['public']['Tables']['users']['Insert'], 'id'>) => Promise<{ error: any }>;
  updateUserProfile: (profile: Partial<Database['public']['Tables']['users']['Update']>) => Promise<{ error: any }>;
  refreshUserProfile: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only set up auth listener if Supabase is properly configured
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Initial session check
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured - cannot fetch user profile');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase not configured. Please check your environment variables.') };
    }

    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase not configured. Please check your environment variables.') };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase not configured. Please check your environment variables.') };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const createUserProfile = async (profile: Omit<Database['public']['Tables']['users']['Insert'], 'id'>) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase not configured. Please check your environment variables.') };
    }

    try {
      if (!user) {
        return { error: new Error('User not authenticated') };
      }

      const { error } = await supabase.from('users').insert({
        ...profile,
        id: user.id,
      });

      if (!error) {
        await fetchUserProfile(user.id);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const updateUserProfile = async (profile: Partial<Database['public']['Tables']['users']['Update']>) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase not configured. Please check your environment variables.') };
    }

    try {
      if (!user) {
        return { error: new Error('User not authenticated') };
      }

      const { error } = await supabase
        .from('users')
        .update(profile)
        .eq('id', user.id);

      if (!error) {
        await fetchUserProfile(user.id);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const refreshUserProfile = async () => {
    if (user && isSupabaseConfigured) {
      await fetchUserProfile(user.id);
    }
  };

  const value = {
    session,
    user,
    userProfile,
    signUp,
    signIn,
    signOut,
    createUserProfile,
    updateUserProfile,
    refreshUserProfile,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};