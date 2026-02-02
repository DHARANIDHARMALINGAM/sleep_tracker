/**
 * Theme Constants
 * 
 * Centralized theme definitions for the Sleep Tracker app.
 * Supports both light and dark modes with a modern, sleep-friendly color palette.
 */

export const Colors = {
    // Primary colors - Sleepy purple/blue tones
    primary: '#6C63FF',
    primaryLight: '#8B85FF',
    primaryDark: '#4A42E6',

    // Accent colors
    accent: '#FF6B9D',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#FF5252',

    // Dark theme colors
    dark: {
        background: '#0D0D1A',
        surface: '#1A1A2E',
        surfaceElevated: '#252542',
        text: '#FFFFFF',
        textSecondary: '#A0A0B8',
        textMuted: '#6B6B80',
        border: '#2A2A45',
    },

    // Light theme colors
    light: {
        background: '#F5F5FA',
        surface: '#FFFFFF',
        surfaceElevated: '#FFFFFF',
        text: '#1A1A2E',
        textSecondary: '#6B6B80',
        textMuted: '#A0A0B8',
        border: '#E0E0E8',
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const FontSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    hero: 48,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

/**
 * Get theme colors based on current color scheme
 */
export const getThemeColors = (isDark: boolean) => {
    return {
        primary: Colors.primary,
        primaryLight: Colors.primaryLight,
        primaryDark: Colors.primaryDark,
        accent: Colors.accent,
        success: Colors.success,
        warning: Colors.warning,
        error: Colors.error,
        ...(isDark ? Colors.dark : Colors.light),
    };
};

export type ThemeColors = ReturnType<typeof getThemeColors>;
