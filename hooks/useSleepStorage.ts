/**
 * Sleep Storage Hook
 * 
 * Provides CRUD operations for sleep entries using AsyncStorage.
 * All data is stored locally on the device.
 */

import { SleepEntry, WeeklyStats } from '@/types/sleep';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = '@sleep_tracker_entries';

/**
 * Generate a unique ID for new sleep entries
 */
const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

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
 * Hook for managing sleep entries with AsyncStorage
 */
export function useSleepStorage() {
    const [entries, setEntries] = useState<SleepEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load entries on mount
    useEffect(() => {
        loadEntries();
    }, []);

    /**
     * Load all sleep entries from storage
     */
    const loadEntries = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data) as SleepEntry[];
                // Sort by bedtime, most recent first
                parsed.sort((a, b) => new Date(b.bedtime).getTime() - new Date(a.bedtime).getTime());
                setEntries(parsed);
            } else {
                setEntries([]);
            }
        } catch (e) {
            console.error('Error loading sleep entries:', e);
            setError('Failed to load sleep data');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Save entries to storage
     */
    const saveEntries = async (newEntries: SleepEntry[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
            setEntries(newEntries);
        } catch (e) {
            console.error('Error saving sleep entries:', e);
            setError('Failed to save sleep data');
            throw e;
        }
    };

    /**
     * Add a new sleep entry
     */
    const addEntry = useCallback(async (
        bedtime: Date,
        wakeTime: Date,
        note?: string
    ): Promise<SleepEntry> => {
        const duration = calculateDuration(bedtime, wakeTime);

        const newEntry: SleepEntry = {
            id: generateId(),
            bedtime: bedtime.toISOString(),
            wakeTime: wakeTime.toISOString(),
            duration,
            note: note?.trim() || undefined,
        };

        const updatedEntries = [newEntry, ...entries];
        await saveEntries(updatedEntries);

        return newEntry;
    }, [entries]);

    /**
     * Update an existing sleep entry
     */
    const updateEntry = useCallback(async (
        id: string,
        bedtime: Date,
        wakeTime: Date,
        note?: string
    ): Promise<SleepEntry | null> => {
        const index = entries.findIndex(e => e.id === id);
        if (index === -1) return null;

        const duration = calculateDuration(bedtime, wakeTime);

        const updatedEntry: SleepEntry = {
            id,
            bedtime: bedtime.toISOString(),
            wakeTime: wakeTime.toISOString(),
            duration,
            note: note?.trim() || undefined,
        };

        const updatedEntries = [...entries];
        updatedEntries[index] = updatedEntry;

        // Re-sort after update
        updatedEntries.sort((a, b) =>
            new Date(b.bedtime).getTime() - new Date(a.bedtime).getTime()
        );

        await saveEntries(updatedEntries);

        return updatedEntry;
    }, [entries]);

    /**
     * Delete a sleep entry
     */
    const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
        const updatedEntries = entries.filter(e => e.id !== id);
        if (updatedEntries.length === entries.length) return false;

        await saveEntries(updatedEntries);
        return true;
    }, [entries]);

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
     * Clear all sleep data
     */
    const clearAllData = useCallback(async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setEntries([]);
        } catch (e) {
            console.error('Error clearing sleep data:', e);
            setError('Failed to clear sleep data');
            throw e;
        }
    }, []);

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
