/**
 * Empty State Component
 * 
 * Displays when there's no sleep data to show.
 * Provides a call-to-action to add the first entry.
 */

import { FontSizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
    title: string;
    message: string;
    icon?: keyof typeof Ionicons.glyphMap;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    title,
    message,
    icon = 'moon-outline',
    actionLabel,
    onAction,
}: EmptyStateProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevated }]}>
                <Ionicons name={icon} size={48} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    variant="primary"
                    style={styles.actionButton}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: '600',
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: FontSizes.md,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 280,
    },
    actionButton: {
        marginTop: Spacing.xl,
        minWidth: 200,
    },
});
