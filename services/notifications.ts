/**
 * Notification Service
 * 
 * Handles push notification permissions and scheduling for bedtime reminders.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request notification permissions from the user
 * @returns Whether permissions were granted
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
    }

    // Android requires a notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('bedtime-reminders', {
            name: 'Bedtime Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#7C3AED',
        });
    }

    return true;
}

/**
 * Schedule a daily bedtime reminder
 * @param reminderTime Time in HH:MM format (e.g., "22:00")
 * @param targetHours Target sleep hours for the message
 */
export async function scheduleBedtimeReminder(
    reminderTime: string,
    targetHours: number
): Promise<string | null> {
    try {
        // Cancel any existing reminders first
        await cancelBedtimeReminder();

        // Parse time
        const [hours, minutes] = reminderTime.split(':').map(Number);

        // Schedule the notification
        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: '🌙 Time for bed!',
                body: `Get your ${targetHours} hours of sleep for a better tomorrow.`,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: hours,
                minute: minutes,
            },
        });

        console.log('Scheduled bedtime reminder:', identifier);
        return identifier;
    } catch (error) {
        console.error('Failed to schedule notification:', error);
        return null;
    }
}

/**
 * Cancel the bedtime reminder
 */
export async function cancelBedtimeReminder(): Promise<void> {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('Cancelled all scheduled notifications');
    } catch (error) {
        console.error('Failed to cancel notifications:', error);
    }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Format time for display (e.g., "22:00" -> "10:00 PM")
 */
export function formatReminderTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Parse display time to 24h format (e.g., "10:00 PM" -> "22:00")
 */
export function parseDisplayTime(displayTime: string): string {
    const match = displayTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '22:00';

    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}
