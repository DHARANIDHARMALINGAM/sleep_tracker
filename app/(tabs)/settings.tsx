/**
 * Settings Screen
 * 
 * App settings and preferences.
 * 
 * Features:
 * - Dark mode toggle (UI only)
 * - Clear all sleep data with confirmation
 */

import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useSleepStorage } from '@/hooks/useSleepStorage';
import { useUserSettings } from '@/hooks/useUserSettings';
import { formatReminderTime } from '@/services/notifications';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const { colors, isDark, toggleTheme } = useTheme();
    const { signOut, user } = useAuth();
    const { clearAllData, entries } = useSleepStorage();
    const { settings, updateSettings, loading: settingsLoading } = useUserSettings();
    const [isClearing, setIsClearing] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const HOUR_OPTIONS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

    const handleTargetHoursChange = async (increment: number) => {
        if (!settings) return;
        const currentIndex = HOUR_OPTIONS.indexOf(settings.targetHours);
        const newIndex = currentIndex + increment;
        if (newIndex >= 0 && newIndex < HOUR_OPTIONS.length) {
            await updateSettings({ targetHours: HOUR_OPTIONS[newIndex] });
        }
    };

    const handleReminderToggle = async (enabled: boolean) => {
        await updateSettings({ reminderEnabled: enabled });
    };

    const handleTimeChange = async (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            await updateSettings({ reminderTime: `${hours}:${minutes}` });
        }
    };

    const parseTimeToDate = (time: string): Date => {
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    /**
     * Handle clearing all sleep data
     * Shows a confirmation dialog before proceeding
     */
    const handleClearData = () => {
        if (entries.length === 0) {
            Alert.alert('No Data', 'There is no sleep data to clear.');
            return;
        }

        Alert.alert(
            'Clear All Data',
            `Are you sure you want to delete all ${entries.length} sleep entries? This action cannot be undone.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsClearing(true);
                            await clearAllData();
                            Alert.alert('Success', 'All sleep data has been cleared.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear sleep data. Please try again.');
                        } finally {
                            setIsClearing(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Appearance Section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Appearance
                </Text>
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primaryLight }}
                            thumbColor={isDark ? colors.primary : colors.surface}
                        />
                    </View>
                </View>

                {/* Sleep Goals Section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Sleep Goals
                </Text>
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {/* Target Hours */}
                    <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                                <Ionicons name="time-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Target Hours</Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    How many hours you want to sleep
                                </Text>
                            </View>
                        </View>
                        <View style={styles.hoursAdjuster}>
                            <TouchableOpacity
                                style={[styles.adjustButton, { backgroundColor: colors.primary + '15' }]}
                                onPress={() => handleTargetHoursChange(-1)}
                                disabled={settingsLoading || !settings || settings.targetHours === HOUR_OPTIONS[0]}
                            >
                                <Ionicons name="remove" size={18} color={colors.primary} />
                            </TouchableOpacity>
                            <Text style={[styles.hoursValue, { color: colors.primary }]}>
                                {settings?.targetHours || 8}h
                            </Text>
                            <TouchableOpacity
                                style={[styles.adjustButton, { backgroundColor: colors.primary + '15' }]}
                                onPress={() => handleTargetHoursChange(1)}
                                disabled={settingsLoading || !settings || settings.targetHours === HOUR_OPTIONS[HOUR_OPTIONS.length - 1]}
                            >
                                <Ionicons name="add" size={18} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Reminder Toggle */}
                    <View style={[styles.settingRow, settings?.reminderEnabled ? { borderBottomWidth: 1, borderBottomColor: colors.border } : {}]}>
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: '#FFD700' + '20' }]}>
                                <Ionicons name="notifications-outline" size={20} color="#FFD700" />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Bedtime Reminder</Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    Get notified when it's time to sleep
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={settings?.reminderEnabled || false}
                            onValueChange={handleReminderToggle}
                            trackColor={{ false: colors.border, true: colors.primaryLight }}
                            thumbColor={settings?.reminderEnabled ? colors.primary : colors.surface}
                            disabled={settingsLoading}
                        />
                    </View>

                    {/* Reminder Time */}
                    {settings?.reminderEnabled && (
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <View style={[styles.iconContainer, { backgroundColor: 'transparent' }]} />
                                <View>
                                    <Text style={[styles.settingLabel, { color: colors.text }]}>Reminder Time</Text>
                                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                        When to remind you
                                    </Text>
                                </View>
                            </View>
                            {Platform.OS === 'ios' ? (
                                <DateTimePicker
                                    value={parseTimeToDate(settings.reminderTime)}
                                    mode="time"
                                    display="compact"
                                    onChange={handleTimeChange}
                                    themeVariant={isDark ? 'dark' : 'light'}
                                />
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={[styles.timeButton, { backgroundColor: colors.primary + '15' }]}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <Text style={[styles.timeButtonText, { color: colors.primary }]}>
                                            {formatReminderTime(settings.reminderTime)}
                                        </Text>
                                    </TouchableOpacity>
                                    {showTimePicker && (
                                        <DateTimePicker
                                            value={parseTimeToDate(settings.reminderTime)}
                                            mode="time"
                                            is24Hour={false}
                                            display="default"
                                            onChange={handleTimeChange}
                                        />
                                    )}
                                </>
                            )}
                        </View>
                    )}
                </View>

                {/* Data Section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Data Management
                </Text>
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={handleClearData}
                        disabled={isClearing}
                    >
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: Colors.error + '20' }]}>
                                <Ionicons name="trash-outline" size={20} color={Colors.error} />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: Colors.error }]}>
                                    Clear All Data
                                </Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    {entries.length > 0
                                        ? `Delete all ${entries.length} sleep entries`
                                        : 'No sleep data to delete'}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Account Section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Account
                </Text>
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                                <Ionicons name="person-outline" size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Email</Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    {user?.email || 'Not signed in'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => {
                            Alert.alert(
                                'Sign Out',
                                'Are you sure you want to sign out?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Sign Out', style: 'destructive', onPress: signOut },
                                ]
                            );
                        }}
                    >
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: Colors.error + '20' }]}>
                                <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: Colors.error }]}>
                                    Sign Out
                                </Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    Sign out of your account
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    About
                </Text>
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Version</Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    1.0.0
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Ionicons name="moon" size={32} color={colors.primary} />
                    <Text style={[styles.footerText, { color: colors.textMuted }]}>
                        Sleep Tracker
                    </Text>
                    <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>
                        Track your sleep, improve your health
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
        marginTop: Spacing.md,
        marginLeft: Spacing.sm,
    },
    section: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: Spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabel: {
        fontSize: FontSizes.md,
        fontWeight: '500',
    },
    settingDescription: {
        fontSize: FontSizes.sm,
        marginTop: 2,
    },
    footer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: Spacing.xl,
        gap: Spacing.xs,
    },
    footerText: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        marginTop: Spacing.sm,
    },
    footerSubtext: {
        fontSize: FontSizes.sm,
    },
    hoursAdjuster: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    adjustButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hoursValue: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        minWidth: 40,
        textAlign: 'center',
    },
    timeButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    timeButtonText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
});
