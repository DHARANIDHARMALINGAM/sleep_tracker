/**
 * Add Sleep Entry Modal
 * 
 * Modal screen for adding a new sleep entry.
 * 
 * Features:
 * - Time picker for bedtime
 * - Time picker for wake-up time
 * - Optional note input
 * - Form validation (wake time must be after bedtime, accounting for overnight sleep)
 * - Save functionality with feedback
 */

import { Button } from '@/components/Button';
import { QualityRating } from '@/components/QualityRating';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { calculateDuration, formatDuration, formatTime, useSleepStorage } from '@/hooks/useSleepStorage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddSleepScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { addEntry } = useSleepStorage();

    // Form state
    const [bedtime, setBedtime] = useState(() => {
        const date = new Date();
        date.setHours(22, 0, 0, 0); // Default to 10:00 PM
        return date;
    });
    const [wakeTime, setWakeTime] = useState(() => {
        const date = new Date();
        date.setHours(7, 0, 0, 0); // Default to 7:00 AM
        return date;
    });
    const [note, setNote] = useState('');
    const [quality, setQuality] = useState<number>(3);
    const [isSaving, setIsSaving] = useState(false);

    // Time picker visibility (for Android)
    const [showBedtimePicker, setShowBedtimePicker] = useState(Platform.OS === 'ios');
    const [showWakeTimePicker, setShowWakeTimePicker] = useState(Platform.OS === 'ios');

    // Calculate current duration for preview
    const duration = calculateDuration(bedtime, wakeTime);

    /**
     * Handle bedtime change from picker
     */
    const handleBedtimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowBedtimePicker(false);
        }
        if (selectedDate) {
            setBedtime(selectedDate);
        }
    };

    /**
     * Handle wake time change from picker
     */
    const handleWakeTimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowWakeTimePicker(false);
        }
        if (selectedDate) {
            setWakeTime(selectedDate);
        }
    };

    /**
     * Validate form and save entry
     */
    const handleSave = async () => {
        // Validate duration is reasonable (between 0.5 and 24 hours)
        if (duration < 0.5) {
            Alert.alert(
                'Invalid Duration',
                'Sleep duration should be at least 30 minutes. Please check your times.'
            );
            return;
        }

        if (duration > 24) {
            Alert.alert(
                'Invalid Duration',
                'Sleep duration cannot exceed 24 hours. Please check your times.'
            );
            return;
        }

        try {
            setIsSaving(true);
            await addEntry(bedtime, wakeTime, note, quality);

            // Navigate back with success
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to save sleep entry. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Duration Preview */}
                    <View style={[styles.durationPreview, { backgroundColor: colors.primary }]}>
                        <Ionicons name="moon" size={24} color="#FFFFFF" />
                        <Text style={styles.durationText}>{formatDuration(duration)}</Text>
                        <Text style={styles.durationLabel}>of sleep</Text>
                    </View>

                    {/* Bedtime Picker */}
                    <View style={styles.pickerSection}>
                        <View style={styles.pickerHeader}>
                            <View style={[styles.iconBadge, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name="bed-outline" size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.pickerLabel, { color: colors.text }]}>Bedtime</Text>
                        </View>

                        {Platform.OS === 'android' && !showBedtimePicker && (
                            <TouchableOpacity
                                style={[styles.timeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => setShowBedtimePicker(true)}
                            >
                                <Text style={[styles.timeButtonText, { color: colors.text }]}>
                                    {formatTime(bedtime)}
                                </Text>
                                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}

                        {(Platform.OS === 'ios' || showBedtimePicker) && (
                            <View style={[styles.pickerContainer, { backgroundColor: colors.surface }]}>
                                <DateTimePicker
                                    value={bedtime}
                                    mode="time"
                                    is24Hour={false}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleBedtimeChange}
                                    textColor={colors.text}
                                    themeVariant={colors.background === '#0D0D1A' ? 'dark' : 'light'}
                                />
                            </View>
                        )}
                    </View>

                    {/* Wake Time Picker */}
                    <View style={styles.pickerSection}>
                        <View style={styles.pickerHeader}>
                            <View style={[styles.iconBadge, { backgroundColor: colors.accent + '20' }]}>
                                <Ionicons name="sunny-outline" size={20} color={colors.accent} />
                            </View>
                            <Text style={[styles.pickerLabel, { color: colors.text }]}>Wake-up Time</Text>
                        </View>

                        {Platform.OS === 'android' && !showWakeTimePicker && (
                            <TouchableOpacity
                                style={[styles.timeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => setShowWakeTimePicker(true)}
                            >
                                <Text style={[styles.timeButtonText, { color: colors.text }]}>
                                    {formatTime(wakeTime)}
                                </Text>
                                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}

                        {(Platform.OS === 'ios' || showWakeTimePicker) && (
                            <View style={[styles.pickerContainer, { backgroundColor: colors.surface }]}>
                                <DateTimePicker
                                    value={wakeTime}
                                    mode="time"
                                    is24Hour={false}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleWakeTimeChange}
                                    textColor={colors.text}
                                    themeVariant={colors.background === '#0D0D1A' ? 'dark' : 'light'}
                                />
                            </View>
                        )}
                    </View>

                    {/* Note Input */}
                    <View style={styles.noteSection}>
                        <View style={styles.pickerHeader}>
                            <View style={[styles.iconBadge, { backgroundColor: colors.textSecondary + '20' }]}>
                                <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
                            </View>
                            <Text style={[styles.pickerLabel, { color: colors.text }]}>Note (Optional)</Text>
                        </View>
                        <TextInput
                            style={[
                                styles.noteInput,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    color: colors.text,
                                },
                            ]}
                            placeholder="How was your sleep? Any dreams?"
                            placeholderTextColor={colors.textMuted}
                            value={note}
                            onChangeText={setNote}
                            multiline
                            numberOfLines={3}
                            maxLength={200}
                        />
                        <Text style={[styles.charCount, { color: colors.textMuted }]}>
                            {note.length}/200
                        </Text>
                    </View>

                    {/* Quality Rating */}
                    <View style={styles.qualitySection}>
                        <View style={styles.pickerHeader}>
                            <View style={[styles.iconBadge, { backgroundColor: '#FFD700' + '20' }]}>
                                <Ionicons name="star" size={20} color="#FFD700" />
                            </View>
                            <Text style={[styles.pickerLabel, { color: colors.text }]}>Sleep Quality</Text>
                        </View>
                        <View style={[styles.qualityContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <QualityRating
                                value={quality}
                                onChange={setQuality}
                                size="large"
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Save Button */}
                <View style={[styles.footer, { backgroundColor: colors.background }]}>
                    <Button
                        title="Save Sleep Entry"
                        onPress={handleSave}
                        variant="primary"
                        size="large"
                        loading={isSaving}
                        style={styles.saveButton}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    durationPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xl,
        gap: Spacing.sm,
    },
    durationText: {
        color: '#FFFFFF',
        fontSize: FontSizes.xxl,
        fontWeight: '700',
    },
    durationLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: FontSizes.md,
    },
    pickerSection: {
        marginBottom: Spacing.lg,
    },
    pickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.sm,
    },
    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerLabel: {
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    pickerContainer: {
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    timeButtonText: {
        fontSize: FontSizes.xl,
        fontWeight: '600',
    },
    noteSection: {
        marginBottom: Spacing.lg,
    },
    noteInput: {
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: FontSizes.xs,
        textAlign: 'right',
        marginTop: Spacing.xs,
    },
    footer: {
        padding: Spacing.md,
        paddingBottom: Spacing.lg,
    },
    saveButton: {
        borderRadius: BorderRadius.lg,
    },
    qualitySection: {
        marginBottom: Spacing.lg,
    },
    qualityContainer: {
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        alignItems: 'center',
    },
});
