/**
 * Authentication Context
 * 
 * Provides authentication state management throughout the app.
 * Handles sign up, sign in, and sign out operations with Supabase.
 */

import { supabase } from '@/lib/supabase';
import { AuthContextType } from '@/types/auth';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Sign up with email and password
     */
    const signUp = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            return { error: error ? new Error(error.message) : null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    /**
     * Sign in with email and password
     */
    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error: error ? new Error(error.message) : null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    /**
     * Sign out the current user
     */
    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                isAuthenticated: !!user,
                signUp,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth context
 * Must be used within an AuthProvider
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
