/**
 * Sleep Storage Hook
 * 
 * Provides CRUD operations for sleep entries using Supabase.
 * Data is synced with the cloud and persisted in the database.
 */

import { useAuth } from '@/context/AuthContext';
import { DbSleepEntry, supabase } from '@/lib/supabase';
import { SleepEntry, WeeklyStats } from '@/types/sleep';
import { useCallback, useEffect, useState } from 'react';

/**
 * Calculate sleep duration in hours between two dates
 */
export const calculateDuration = (bedtime: Date, wakeTime: Date): number => {
    let diff = wakeTime.getTime() - bedtime.getTime();

    // If wake time is before bedtime, assume next day
    if (diff < 0) {
        diff += 24 * 60 * 60 * 1000; // Add 24 hours
    }

    // Convert to hours with one decimal place
    return Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
};

/**
 * Format duration in hours to readable string (e.g., "7h 30m")
 */
export const formatDuration = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    if (m === 0) {
        return `${h}h`;
    }
    return `${h}h ${m}m`;
};

/**
 * Format time from Date to readable string (e.g., "10:30 PM")
 */
export const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Format date to readable string (e.g., "Mon, Jan 15")
 */
export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Convert database entry to app entry format
 */
const toSleepEntry = (dbEntry: DbSleepEntry): SleepEntry => ({
    id: dbEntry.id,
    bedtime: dbEntry.bedtime,
    wakeTime: dbEntry.wake_time,
    duration: dbEntry.duration,
    note: dbEntry.note || undefined,
    quality: dbEntry.quality || undefined,
});

/**
 * Hook for managing sleep entries with Supabase
 */
export function useSleepStorage() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<SleepEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load entries when user changes
    useEffect(() => {
        if (user) {
            loadEntries();
        } else {
            setEntries([]);
            setLoading(false);
        }
    }, [user]);

    /**
     * Load all sleep entries from Supabase
     */
    const loadEntries = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('sleep_entries')
                .select('*')
                .eq('user_id', user.id)
                .order('bedtime', { ascending: false });

            if (fetchError) throw fetchError;

            const sleepEntries = (data || []).map(toSleepEntry);
            setEntries(sleepEntries);
        } catch (e) {
            console.error('Error loading sleep entries:', e);
            setError('Failed to load sleep data');
        } finally {
            setLoading(false);
        }
    }, [user]);

    /**
     * Add a new sleep entry
     */
    const addEntry = useCallback(async (
        bedtime: Date,
        wakeTime: Date,
        note?: string,
        quality?: number
    ): Promise<SleepEntry> => {
        if (!user) throw new Error('User not authenticated');

        const duration = calculateDuration(bedtime, wakeTime);

        const { data, error: insertError } = await supabase
            .from('sleep_entries')
            .insert({
                user_id: user.id,
                bedtime: bedtime.toISOString(),
                wake_time: wakeTime.toISOString(),
                duration,
                note: note?.trim() || null,
                quality: quality || null,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        const newEntry = toSleepEntry(data);
        setEntries(prev => [newEntry, ...prev]);

        return newEntry;
    }, [user]);

    /**
     * Update an existing sleep entry
     */
    const updateEntry = useCallback(async (
        id: string,
        bedtime: Date,
        wakeTime: Date,
        note?: string,
        quality?: number
    ): Promise<SleepEntry | null> => {
        if (!user) throw new Error('User not authenticated');

        const duration = calculateDuration(bedtime, wakeTime);

        const { data, error: updateError } = await supabase
            .from('sleep_entries')
            .update({
                bedtime: bedtime.toISOString(),
                wake_time: wakeTime.toISOString(),
                duration,
                note: note?.trim() || null,
                quality: quality || null,
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (updateError) throw updateError;
        if (!data) return null;

        const updatedEntry = toSleepEntry(data);

        setEntries(prev => {
            const updated = prev.map(e => e.id === id ? updatedEntry : e);
            // Re-sort after update
            updated.sort((a, b) =>
                new Date(b.bedtime).getTime() - new Date(a.bedtime).getTime()
            );
            return updated;
        });

        return updatedEntry;
    }, [user]);

    /**
     * Delete a sleep entry
     */
    const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
        if (!user) throw new Error('User not authenticated');

        const { error: deleteError } = await supabase
            .from('sleep_entries')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        setEntries(prev => prev.filter(e => e.id !== id));
        return true;
    }, [user]);

    /**
     * Get a single entry by ID
     */
    const getEntry = useCallback((id: string): SleepEntry | undefined => {
        return entries.find(e => e.id === id);
    }, [entries]);

    /**
     * Get the most recent sleep entry
     */
    const getLatestEntry = useCallback((): SleepEntry | undefined => {
        return entries[0];
    }, [entries]);

    /**
     * Clear all sleep data for the current user
     */
    const clearAllData = useCallback(async (): Promise<void> => {
        if (!user) throw new Error('User not authenticated');

        const { error: deleteError } = await supabase
            .from('sleep_entries')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        setEntries([]);
    }, [user]);

    /**
     * Get weekly statistics for the chart
     */
    const getWeeklyStats = useCallback((): WeeklyStats => {
        const now = new Date();
        const dayLabels: string[] = [];
        const dailyDurations: number[] = [];

        // Get data for the last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            // Format day label
            dayLabels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

            // Find entries for this day (based on bedtime)
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            const dayEntries = entries.filter(entry => {
                const bedtime = new Date(entry.bedtime);
                return bedtime >= dayStart && bedtime <= dayEnd;
            });

            // Sum durations for the day
            const totalDuration = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
            dailyDurations.push(totalDuration);
        }

        // Calculate average (only counting days with data)
        const daysWithData = dailyDurations.filter(d => d > 0);
        const averageDuration = daysWithData.length > 0
            ? daysWithData.reduce((a, b) => a + b, 0) / daysWithData.length
            : 0;

        return {
            dayLabels,
            dailyDurations,
            averageDuration: Math.round(averageDuration * 10) / 10,
            totalEntries: entries.length,
        };
    }, [entries]);

    return {
        entries,
        loading,
        error,
        addEntry,
        updateEntry,
        deleteEntry,
        getEntry,
        getLatestEntry,
        clearAllData,
        getWeeklyStats,
        refresh: loadEntries,
    };
}
