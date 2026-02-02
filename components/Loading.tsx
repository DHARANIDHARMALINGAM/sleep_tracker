/**
 * Loading Component
 * 
 * Full-screen loading indicator with optional message.
 */

import { FontSizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingProps {
    message?: string;
}

export function Loading({ message = 'Loading...' }: LoadingProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    message: {
        marginTop: Spacing.md,
        fontSize: FontSizes.md,
    },
});
