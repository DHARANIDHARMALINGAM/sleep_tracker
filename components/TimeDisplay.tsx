/**
 * Time Display Component
 * 
 * A formatted time display with an icon.
 * Used for showing bedtime and wake-up times.
 */

import { FontSizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TimeDisplayProps {
    time: Date | string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
}

export function TimeDisplay({ time, label, icon, iconColor }: TimeDisplayProps) {
    const { colors } = useTheme();

    const date = typeof time === 'string' ? new Date(time) : time;

    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevated }]}>
                <Ionicons name={icon} size={24} color={iconColor || colors.primary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.time, { color: colors.text }]}>{formattedTime}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: FontSizes.sm,
        marginBottom: 2,
    },
    time: {
        fontSize: FontSizes.xl,
        fontWeight: '600',
    },
});
