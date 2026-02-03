/**
 * User Settings Hook
 * 
 * Manages user settings for sleep goals and reminders.
 * Syncs with Supabase and handles notification scheduling.
 */

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { cancelBedtimeReminder, scheduleBedtimeReminder } from '@/services/notifications';
import { DbUserSettings, UpdateSettingsInput, UserSettings } from '@/types/settings';
import { useCallback, useEffect, useState } from 'react';

/**
 * Convert database settings to app format
 */
const toUserSettings = (db: DbUserSettings): UserSettings => ({
    id: db.id,
    userId: db.user_id,
    targetHours: Number(db.target_hours),
    reminderEnabled: db.reminder_enabled,
    reminderTime: db.reminder_time,
    onboardingCompleted: db.onboarding_completed,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
});

/**
 * Default settings for new users
 */
const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
    targetHours: 8.0,
    reminderEnabled: false,
    reminderTime: '22:00',
    onboardingCompleted: false,
};

export function useUserSettings() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch user settings from database
     */
    const fetchSettings = useCallback(async () => {
        if (!user) {
            setSettings(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (fetchError) {
                // If no settings exist, create default settings
                if (fetchError.code === 'PGRST116') {
                    const newSettings = await createDefaultSettings();
                    setSettings(newSettings);
                } else {
                    throw fetchError;
                }
            } else {
                setSettings(toUserSettings(data));
            }
        } catch (e) {
            console.error('Error fetching settings:', e);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, [user]);

    /**
     * Create default settings for new user
     */
    const createDefaultSettings = async (): Promise<UserSettings | null> => {
        if (!user) return null;

        try {
            const { data, error: insertError } = await supabase
                .from('user_settings')
                .insert({
                    user_id: user.id,
                    target_hours: DEFAULT_SETTINGS.targetHours,
                    reminder_enabled: DEFAULT_SETTINGS.reminderEnabled,
                    reminder_time: DEFAULT_SETTINGS.reminderTime,
                    onboarding_completed: DEFAULT_SETTINGS.onboardingCompleted,
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return toUserSettings(data);
        } catch (e) {
            console.error('Error creating default settings:', e);
            return null;
        }
    };

    /**
     * Update user settings
     */
    const updateSettings = useCallback(async (updates: UpdateSettingsInput): Promise<boolean> => {
        if (!user || !settings) return false;

        try {
            const dbUpdates: Partial<DbUserSettings> = {};

            if (updates.targetHours !== undefined) {
                dbUpdates.target_hours = updates.targetHours;
            }
            if (updates.reminderEnabled !== undefined) {
                dbUpdates.reminder_enabled = updates.reminderEnabled;
            }
            if (updates.reminderTime !== undefined) {
                dbUpdates.reminder_time = updates.reminderTime;
            }
            if (updates.onboardingCompleted !== undefined) {
                dbUpdates.onboarding_completed = updates.onboardingCompleted;
            }

            dbUpdates.updated_at = new Date().toISOString();

            const { data, error: updateError } = await supabase
                .from('user_settings')
                .update(dbUpdates)
                .eq('user_id', user.id)
                .select()
                .single();

            if (updateError) throw updateError;

            const updatedSettings = toUserSettings(data);
            setSettings(updatedSettings);

            // Handle notification scheduling
            if (updatedSettings.reminderEnabled) {
                await scheduleBedtimeReminder(
                    updatedSettings.reminderTime,
                    updatedSettings.targetHours
                );
            } else {
                await cancelBedtimeReminder();
            }

            return true;
        } catch (e) {
            console.error('Error updating settings:', e);
            setError('Failed to update settings');
            return false;
        }
    }, [user, settings]);

    /**
     * Complete onboarding
     */
    const completeOnboarding = useCallback(async (
        targetHours: number,
        reminderEnabled: boolean,
        reminderTime: string
    ): Promise<boolean> => {
        return updateSettings({
            targetHours,
            reminderEnabled,
            reminderTime,
            onboardingCompleted: true,
        });
    }, [updateSettings]);

    // Fetch settings when user changes
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        loading,
        error,
        updateSettings,
        completeOnboarding,
        refetch: fetchSettings,
        needsOnboarding: settings ? !settings.onboardingCompleted : false,
    };
}
