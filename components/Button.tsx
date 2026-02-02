/**
 * Themed Button Component
 * 
 * A styled button component that supports primary and secondary variants.
 * Automatically uses theme colors.
 */

import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    style,
    textStyle,
    icon,
}: ButtonProps) {
    const { colors } = useTheme();

    const getBackgroundColor = () => {
        if (disabled) return colors.textMuted;
        switch (variant) {
            case 'primary':
                return colors.primary;
            case 'secondary':
                return colors.surfaceElevated;
            case 'danger':
                return colors.error;
            case 'ghost':
                return 'transparent';
            default:
                return colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return colors.textSecondary;
        switch (variant) {
            case 'primary':
            case 'danger':
                return '#FFFFFF';
            case 'secondary':
                return colors.text;
            case 'ghost':
                return colors.primary;
            default:
                return '#FFFFFF';
        }
    };

    const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
        switch (size) {
            case 'small':
                return {
                    button: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
                    text: { fontSize: FontSizes.sm },
                };
            case 'large':
                return {
                    button: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
                    text: { fontSize: FontSizes.lg },
                };
            default:
                return {
                    button: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
                    text: { fontSize: FontSizes.md },
                };
        }
    };

    const sizeStyles = getSizeStyles();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={[
                styles.button,
                sizeStyles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: variant === 'ghost' ? colors.primary : 'transparent',
                    borderWidth: variant === 'ghost' ? 1 : 0,
                },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <>
                    {icon}
                    <Text
                        style={[
                            styles.text,
                            sizeStyles.text,
                            { color: getTextColor(), marginLeft: icon ? Spacing.sm : 0 },
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.md,
    },
    text: {
        fontWeight: '600',
    },
});
