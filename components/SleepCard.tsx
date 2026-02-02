/**
 * Sleep Card Component
 * 
 * Displays a summary of a sleep entry with bedtime, wake time, and duration.
 * Used in the Today screen and can be tapped to view details.
 */

import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { formatDate, formatDuration, formatTime } from '@/hooks/useSleepStorage';
import { SleepEntry } from '@/types/sleep';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SleepCardProps {
    entry: SleepEntry;
    onPress?: () => void;
    showDate?: boolean;
}

export function SleepCard({ entry, onPress, showDate = true }: SleepCardProps) {
    const { colors } = useTheme();

    const bedtime = new Date(entry.bedtime);
    const wakeTime = new Date(entry.wakeTime);

    const content = (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Duration Badge */}
            <View style={[styles.durationBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="moon" size={16} color="#FFFFFF" />
                <Text style={styles.durationText}>{formatDuration(entry.duration)}</Text>
            </View>

            {/* Date Header */}
            {showDate && (
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                    {formatDate(bedtime)}
                </Text>
            )}

            {/* Time Details */}
            <View style={styles.timesContainer}>
                {/* Bedtime */}
                <View style={styles.timeBlock}>
                    <View style={styles.timeHeader}>
                        <Ionicons name="bed-outline" size={20} color={colors.primary} />
                        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Bedtime</Text>
                    </View>
                    <Text style={[styles.timeValue, { color: colors.text }]}>
                        {formatTime(bedtime)}
                    </Text>
                </View>

                {/* Arrow */}
                <View style={styles.arrowContainer}>
                    <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
                </View>

                {/* Wake Time */}
                <View style={styles.timeBlock}>
                    <View style={styles.timeHeader}>
                        <Ionicons name="sunny-outline" size={20} color={colors.accent} />
                        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Wake up</Text>
                    </View>
                    <Text style={[styles.timeValue, { color: colors.text }]}>
                        {formatTime(wakeTime)}
                    </Text>
                </View>
            </View>

            {/* Note */}
            {entry.note && (
                <View style={[styles.noteContainer, { backgroundColor: colors.surfaceElevated }]}>
                    <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.noteText, { color: colors.textSecondary }]} numberOfLines={2}>
                        {entry.note}
                    </Text>
                </View>
            )}

            {/* Tap indicator */}
            {onPress && (
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textMuted}
                    style={styles.chevron}
                />
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        position: 'relative',
    },
    durationBadge: {
        position: 'absolute',
        top: -Spacing.sm,
        right: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
    },
    durationText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: FontSizes.sm,
    },
    dateText: {
        fontSize: FontSizes.sm,
        marginBottom: Spacing.md,
    },
    timesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeBlock: {
        flex: 1,
    },
    timeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    timeLabel: {
        fontSize: FontSizes.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    timeValue: {
        fontSize: FontSizes.xl,
        fontWeight: '600',
    },
    arrowContainer: {
        paddingHorizontal: Spacing.sm,
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    noteText: {
        flex: 1,
        fontSize: FontSizes.sm,
    },
    chevron: {
        position: 'absolute',
        right: Spacing.md,
        top: '50%',
    },
});
