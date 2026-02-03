/**
 * Supabase Client Configuration
 * 
 * Initializes the Supabase client with secure storage for auth tokens.
 * Uses expo-secure-store for secure token persistence on device.
 */

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = 'https://jkutrgyazdabddmyouwa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdXRyZ3lhemRhYmRkbXlvdXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODMzMDUsImV4cCI6MjA4NTY1OTMwNX0.OfgYVE40WIlnqLITaTqHaKtDxSSQIuL6GbSSbWy2HbA';

/**
 * Custom storage adapter for Supabase auth
 * Uses SecureStore on native platforms, localStorage on web
 */
const ExpoSecureStoreAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        await SecureStore.setItemAsync(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        await SecureStore.deleteItemAsync(key);
    },
};

/**
 * Supabase client instance
 * Configured with secure storage for auth persistence
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

/**
 * Database types for sleep entries
 */
export interface DbSleepEntry {
    id: string;
    user_id: string;
    bedtime: string;
    wake_time: string;
    duration: number;
    note: string | null;
    created_at: string;
}
