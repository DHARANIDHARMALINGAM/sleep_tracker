/**
 * Sleep Entry Type Definitions
 * 
 * Core data model for the sleep tracking application.
 * All sleep records are stored using this interface.
 */

export interface SleepEntry {
    /** Unique identifier for the sleep entry */
    id: string;
    /** ISO date string representing when the user went to bed */
    bedtime: string;
    /** ISO date string representing when the user woke up */
    wakeTime: string;
    /** Sleep duration in hours (calculated from bedtime and wakeTime) */
    duration: number;
    /** Optional note about the sleep (e.g., "felt rested", "bad dreams") */
    note?: string;
    /** Sleep quality rating from 1 (poor) to 5 (excellent) */
    quality?: number;
}

/**
 * Weekly sleep statistics
 */
export interface WeeklyStats {
    /** Array of daily sleep durations for the past 7 days */
    dailyDurations: number[];
    /** Labels for each day (e.g., "Mon", "Tue") */
    dayLabels: string[];
    /** Average sleep duration across the week */
    averageDuration: number;
    /** Total number of sleep entries this week */
    totalEntries: number;
}
