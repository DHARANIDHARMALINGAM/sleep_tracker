/**
 * User Settings Type Definitions
 * 
 * Types for sleep goals and notification preferences.
 */

export interface UserSettings {
    /** Unique identifier */
    id: string;
    /** User ID from auth */
    userId: string;
    /** Target sleep hours per night (e.g., 8.0) */
    targetHours: number;
    /** Whether bedtime reminder is enabled */
    reminderEnabled: boolean;
    /** Reminder time in HH:MM format (e.g., "22:00") */
    reminderTime: string;
    /** Whether user has completed onboarding */
    onboardingCompleted: boolean;
    /** Created timestamp */
    createdAt: string;
    /** Updated timestamp */
    updatedAt: string;
}

/**
 * Database format for user_settings table
 */
export interface DbUserSettings {
    id: string;
    user_id: string;
    target_hours: number;
    reminder_enabled: boolean;
    reminder_time: string;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Settings to update (subset of fields)
 */
export interface UpdateSettingsInput {
    targetHours?: number;
    reminderEnabled?: boolean;
    reminderTime?: string;
    onboardingCompleted?: boolean;
}
