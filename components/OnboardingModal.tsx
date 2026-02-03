/**
 * Onboarding Modal Component
 * 
 * Beautiful first-time setup modal for sleep goals and reminders.
 * Appears after user signs up for the first time.
 */

import { Button } from '@/components/Button';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { requestNotificationPermissions } from '@/services/notifications';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingModalProps {
    visible: boolean;
    onComplete: (targetHours: number, reminderEnabled: boolean, reminderTime: string) => void;
    onSkip: () => void;
}

const HOUR_OPTIONS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

export function OnboardingModal({ visible, onComplete, onSkip }: OnboardingModalProps) {
    const { colors, isDark } = useTheme();

    // State
    const [targetHours, setTargetHours] = useState(8);
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [reminderTime, setReminderTime] = useState(() => {
        const date = new Date();
        date.setHours(22, 0, 0, 0);
        return date;
    });
    const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');
    const [isLoading, setIsLoading] = useState(false);

    // Animation
    const scaleAnim = useState(new Animated.Value(0))[0];

    React.useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [visible]);

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (selectedDate) {
            setReminderTime(selectedDate);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatTimeFor24h = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleComplete = async () => {
        setIsLoading(true);

        if (reminderEnabled) {
            await requestNotificationPermissions();
        }

        onComplete(targetHours, reminderEnabled, formatTimeFor24h(reminderTime));
        setIsLoading(false);
    };

    const decreaseHours = () => {
        const currentIndex = HOUR_OPTIONS.indexOf(targetHours);
        if (currentIndex > 0) {
            setTargetHours(HOUR_OPTIONS[currentIndex - 1]);
        }
    };

    const increaseHours = () => {
        const currentIndex = HOUR_OPTIONS.indexOf(targetHours);
        if (currentIndex < HOUR_OPTIONS.length - 1) {
            setTargetHours(HOUR_OPTIONS[currentIndex + 1]);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={isDark
                            ? ['#1a1a2e', '#16213e', '#1a1a2e']
                            : ['#667eea', '#764ba2', '#667eea']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientContainer}
                    >
                        {/* Decorative Elements */}
                        <View style={styles.decorativeCircle1} />
                        <View style={styles.decorativeCircle2} />

                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="moon" size={40} color="#FFFFFF" />
                            </View>
                            <Text style={styles.title}>Set Your Sleep Goals</Text>
                            <Text style={styles.subtitle}>
                                Let's personalize your sleep tracking experience
                            </Text>
                        </View>

                        {/* Content Card */}
                        <View style={[styles.contentCard, { backgroundColor: colors.surface }]}>
                            {/* Target Hours Section */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '20' }]}>
                                        <Ionicons name="time-outline" size={20} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                        Target Sleep Hours
                                    </Text>
                                </View>

                                <View style={styles.hoursSelector}>
                                    <TouchableOpacity
                                        style={[styles.hourButton, { backgroundColor: colors.primary + '20' }]}
                                        onPress={decreaseHours}
                                        disabled={targetHours === HOUR_OPTIONS[0]}
                                    >
                                        <Ionicons
                                            name="remove"
                                            size={24}
                                            color={targetHours === HOUR_OPTIONS[0] ? colors.textMuted : colors.primary}
                                        />
                                    </TouchableOpacity>

                                    <View style={styles.hoursDisplay}>
                                        <Text style={[styles.hoursValue, { color: colors.primary }]}>
                                            {targetHours}
                                        </Text>
                                        <Text style={[styles.hoursLabel, { color: colors.textSecondary }]}>
                                            hours/night
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.hourButton, { backgroundColor: colors.primary + '20' }]}
                                        onPress={increaseHours}
                                        disabled={targetHours === HOUR_OPTIONS[HOUR_OPTIONS.length - 1]}
                                    >
                                        <Ionicons
                                            name="add"
                                            size={24}
                                            color={targetHours === HOUR_OPTIONS[HOUR_OPTIONS.length - 1] ? colors.textMuted : colors.primary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Divider */}
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />

                            {/* Reminder Section */}
                            <View style={styles.section}>
                                <View style={styles.reminderHeader}>
                                    <View style={styles.sectionHeader}>
                                        <View style={[styles.sectionIcon, { backgroundColor: '#FFD700' + '20' }]}>
                                            <Ionicons name="notifications-outline" size={20} color="#FFD700" />
                                        </View>
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                            Bedtime Reminder
                                        </Text>
                                    </View>
                                    <Switch
                                        value={reminderEnabled}
                                        onValueChange={setReminderEnabled}
                                        trackColor={{ false: colors.border, true: colors.primaryLight }}
                                        thumbColor={reminderEnabled ? colors.primary : colors.surface}
                                    />
                                </View>

                                {reminderEnabled && (
                                    <View style={styles.timePickerContainer}>
                                        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                                            Remind me at
                                        </Text>

                                        {Platform.OS === 'android' && !showTimePicker && (
                                            <TouchableOpacity
                                                style={[styles.timeButton, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}
                                                onPress={() => setShowTimePicker(true)}
                                            >
                                                <Ionicons name="time-outline" size={18} color={colors.primary} />
                                                <Text style={[styles.timeButtonText, { color: colors.primary }]}>
                                                    {formatTime(reminderTime)}
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        {(Platform.OS === 'ios' || showTimePicker) && (
                                            <DateTimePicker
                                                value={reminderTime}
                                                mode="time"
                                                is24Hour={false}
                                                display={Platform.OS === 'ios' ? 'compact' : 'default'}
                                                onChange={handleTimeChange}
                                                themeVariant={isDark ? 'dark' : 'light'}
                                            />
                                        )}
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <Button
                                title="Get Started"
                                onPress={handleComplete}
                                variant="primary"
                                fullWidth
                                loading={isLoading}
                                style={styles.primaryButton}
                            />
                            <TouchableOpacity
                                style={styles.skipButton}
                                onPress={onSkip}
                                disabled={isLoading}
                            >
                                <Text style={styles.skipText}>Skip for now</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 25,
    },
    gradientContainer: {
        padding: Spacing.xl,
        position: 'relative',
        overflow: 'hidden',
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    contentCard: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    section: {
        marginVertical: Spacing.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    sectionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    hoursSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.lg,
    },
    hourButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hoursDisplay: {
        alignItems: 'center',
        minWidth: 100,
    },
    hoursValue: {
        fontSize: 48,
        fontWeight: '700',
    },
    hoursLabel: {
        fontSize: FontSizes.sm,
        marginTop: -Spacing.xs,
    },
    divider: {
        height: 1,
        marginVertical: Spacing.md,
    },
    reminderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Spacing.md,
        paddingLeft: 48,
    },
    timeLabel: {
        fontSize: FontSizes.sm,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    timeButtonText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    actions: {
        gap: Spacing.sm,
    },
    primaryButton: {
        backgroundColor: '#FFFFFF',
    },
    skipButton: {
        alignItems: 'center',
        padding: Spacing.sm,
    },
    skipText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: FontSizes.md,
        fontWeight: '500',
    },
});
