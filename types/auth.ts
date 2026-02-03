/**
 * Authentication Type Definitions
 * 
 * Types for authentication state management.
 */

import { Session, User } from '@supabase/supabase-js';

/**
 * Authentication state interface
 */
export interface AuthState {
    /** Current authenticated user, null if not authenticated */
    user: User | null;
    /** Current session, null if not authenticated */
    session: Session | null;
    /** Whether auth state is being loaded */
    isLoading: boolean;
    /** Whether user is authenticated */
    isAuthenticated: boolean;
}

/**
 * Auth context interface with actions
 */
export interface AuthContextType extends AuthState {
    /** Sign up with email and password */
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
    /** Sign in with email and password */
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    /** Sign out the current user */
    signOut: () => Promise<void>;
    /** Reset password for email */
    resetPassword: (email: string) => Promise<{ error: Error | null }>;
}
