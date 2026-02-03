/**
 * Auth Layout
 * 
 * Stack navigator for authentication screens.
 * Provides a clean presentation without tabs.
 */

import { useTheme } from '@/context/ThemeContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function AuthLayout() {
    const { colors, isDark } = useTheme();

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: colors.background,
                    },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="welcome" />
                <Stack.Screen name="login" />
                <Stack.Screen name="signup" />
            </Stack>
        </>
    );
}
