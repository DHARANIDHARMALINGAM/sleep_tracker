/**
 * Sleep Detail Screen
 * 
 * Shows full details of a sleep entry with edit and delete options.
 * 
 * Features:
 * - Display complete sleep entry information
 * - Edit bedtime, wake time, and notes
 * - Delete entry with confirmation
 * - Navigate back after successful action
 */

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import {
    calculateDuration,
    formatDate,
    formatDuration,
    formatTime,
    useSleepStorage,
} from '@/hooks/useSleepStorage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

export default function SleepDetailScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getEntry, updateEntry, deleteEntry, loading } = useSleepStorage();

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [bedtime, setBedtime] = useState(new Date());
    const [wakeTime, setWakeTime] = useState(new Date());
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Time picker visibility (for Android)
    const [showBedtimePicker, setShowBedtimePicker] = useState(false);
    const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

    // Get the entry data
    const entry = id ? getEntry(id) : undefined;

    // Initialize form state when entry loads
    useEffect(() => {
        if (entry) {
            setBedtime(new Date(entry.bedtime));
            setWakeTime(new Date(entry.wakeTime));
            setNote(entry.note || '');
        }
    }, [entry?.id]);

    // Calculate duration for preview
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
     * Toggle edit mode
     */
    const toggleEditMode = () => {
        if (isEditing && entry) {
            // Reset to original values when canceling
            setBedtime(new Date(entry.bedtime));
            setWakeTime(new Date(entry.wakeTime));
            setNote(entry.note || '');
        }
        setIsEditing(!isEditing);
    };

    /**
     * Save edited entry
     */
    const handleSave = async () => {
        if (!id) return;

        // Validate duration
        if (duration < 0.5 || duration > 24) {
            Alert.alert(
                'Invalid Duration',
                'Sleep duration should be between 30 minutes and 24 hours.'
            );
            return;
        }

        try {
            setIsSaving(true);
            await updateEntry(id, bedtime, wakeTime, note);
            setIsEditing(false);
            Alert.alert('Success', 'Sleep entry updated successfully.');
        } catch (error) {
            Alert.alert('Error', 'Failed to update sleep entry. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Delete entry with confirmation
     */
    const handleDelete = () => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this sleep entry? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (!id) return;
                        try {
                            setIsDeleting(true);
                            await deleteEntry(id);
                            router.back();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete sleep entry. Please try again.');
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return <Loading message="Loading sleep entry..." />;
    }

    if (!entry) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
                <EmptyState
                    title="Entry Not Found"
                    message="This sleep entry could not be found. It may have been deleted."
                    icon="alert-circle-outline"
                    actionLabel="Go Back"
                    onAction={() => router.back()}
                />
            </SafeAreaView>
        );
    }

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
                    {/* Duration Badge */}
                    <View style={[styles.durationCard, { backgroundColor: colors.primary }]}>
                        <Ionicons name="moon" size={32} color="#FFFFFF" />
                        <Text style={styles.durationText}>
                            {formatDuration(isEditing ? duration : entry.duration)}
                        </Text>
                        <Text style={styles.durationLabel}>Total Sleep</Text>
                    </View>

                    {/* Date Display */}
                    <View style={[styles.dateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                        <Text style={[styles.dateText, { color: colors.text }]}>
                            {formatDate(entry.bedtime)}
                        </Text>
                    </View>

                    {/* Bedtime Section */}
                    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.iconBadge, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name="bed-outline" size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Bedtime</Text>
                        </View>

                        {isEditing ? (
                            <>
                                {Platform.OS === 'android' && !showBedtimePicker && (
                                    <TouchableOpacity
                                        style={[styles.timeButton, { borderColor: colors.border }]}
                                        onPress={() => setShowBedtimePicker(true)}
                                    >
                                        <Text style={[styles.timeValue, { color: colors.text }]}>
                                            {formatTime(bedtime)}
                                        </Text>
                                        <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                )}
                                {(Platform.OS === 'ios' || showBedtimePicker) && (
                                    <DateTimePicker
                                        value={bedtime}
                                        mode="time"
                                        is24Hour={false}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={handleBedtimeChange}
                                        textColor={colors.text}
                                        themeVariant={colors.background === '#0D0D1A' ? 'dark' : 'light'}
                                    />
                                )}
                            </>
                        ) : (
                            <Text style={[styles.timeValue, { color: colors.text }]}>
                                {formatTime(entry.bedtime)}
                            </Text>
                        )}
                    </View>

                    {/* Wake Time Section */}
                    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.iconBadge, { backgroundColor: colors.accent + '20' }]}>
                                <Ionicons name="sunny-outline" size={20} color={colors.accent} />
                            </View>
                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Wake Time</Text>
                        </View>

                        {isEditing ? (
                            <>
                                {Platform.OS === 'android' && !showWakeTimePicker && (
                                    <TouchableOpacity
                                        style={[styles.timeButton, { borderColor: colors.border }]}
                                        onPress={() => setShowWakeTimePicker(true)}
                                    >
                                        <Text style={[styles.timeValue, { color: colors.text }]}>
                                            {formatTime(wakeTime)}
                                        </Text>
                                        <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                )}
                                {(Platform.OS === 'ios' || showWakeTimePicker) && (
                                    <DateTimePicker
                                        value={wakeTime}
                                        mode="time"
                                        is24Hour={false}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={handleWakeTimeChange}
                                        textColor={colors.text}
                                        themeVariant={colors.background === '#0D0D1A' ? 'dark' : 'light'}
                                    />
                                )}
                            </>
                        ) : (
                            <Text style={[styles.timeValue, { color: colors.text }]}>
                                {formatTime(entry.wakeTime)}
                            </Text>
                        )}
                    </View>

                    {/* Note Section */}
                    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.iconBadge, { backgroundColor: colors.textSecondary + '20' }]}>
                                <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
                            </View>
                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Note</Text>
                        </View>

                        {isEditing ? (
                            <>
                                <TextInput
                                    style={[
                                        styles.noteInput,
                                        { borderColor: colors.border, color: colors.text },
                                    ]}
                                    placeholder="Add a note about your sleep..."
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
                            </>
                        ) : (
                            <Text style={[styles.noteText, { color: entry.note ? colors.text : colors.textMuted }]}>
                                {entry.note || 'No note added'}
                            </Text>
                        )}
                    </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={[styles.footer, { backgroundColor: colors.background }]}>
                    {isEditing ? (
                        <View style={styles.editButtons}>
                            <Button
                                title="Cancel"
                                onPress={toggleEditMode}
                                variant="secondary"
                                style={styles.editButton}
                            />
                            <Button
                                title="Save Changes"
                                onPress={handleSave}
                                variant="primary"
                                loading={isSaving}
                                style={styles.editButton}
                            />
                        </View>
                    ) : (
                        <View style={styles.actionButtons}>
                            <Button
                                title="Edit"
                                onPress={toggleEditMode}
                                variant="primary"
                                icon={<Ionicons name="create-outline" size={18} color="#FFFFFF" />}
                                style={styles.actionButton}
                            />
                            <Button
                                title="Delete"
                                onPress={handleDelete}
                                variant="danger"
                                loading={isDeleting}
                                icon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" />}
                                style={styles.actionButton}
                            />
                        </View>
                    )}
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
    durationCard: {
        alignItems: 'center',
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
    },
    durationText: {
        color: '#FFFFFF',
        fontSize: FontSizes.hero,
        fontWeight: '700',
        marginTop: Spacing.sm,
    },
    durationLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: FontSizes.md,
        marginTop: Spacing.xs,
    },
    dateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    dateText: {
        fontSize: FontSizes.md,
        fontWeight: '500',
    },
    section: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginBottom: Spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    iconBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionLabel: {
        fontSize: FontSizes.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    timeValue: {
        fontSize: FontSizes.xxl,
        fontWeight: '600',
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
    },
    noteText: {
        fontSize: FontSizes.md,
        lineHeight: 24,
    },
    noteInput: {
        borderWidth: 1,
        borderRadius: BorderRadius.sm,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        minHeight: 80,
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
    actionButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    actionButton: {
        flex: 1,
    },
    editButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    editButton: {
        flex: 1,
    },
});
