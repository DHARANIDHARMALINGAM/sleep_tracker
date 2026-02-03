/**
 * Auth Input Component
 * 
 * Styled text input for authentication forms.
 * Supports email and password input types with proper keyboard settings.
 */

import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';

interface AuthInputProps extends TextInputProps {
    /** Input label */
    label: string;
    /** Error message to display */
    error?: string;
    /** Input type - affects icon and keyboard */
    type?: 'email' | 'password' | 'text';
}

export function AuthInput({
    label,
    error,
    type = 'text',
    value,
    ...props
}: AuthInputProps) {
    const { colors } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const getIcon = () => {
        switch (type) {
            case 'email':
                return 'mail-outline';
            case 'password':
                return 'lock-closed-outline';
            default:
                return 'text-outline';
        }
    };

    const getBorderColor = () => {
        if (error) return colors.error;
        if (isFocused) return colors.primary;
        return colors.border;
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
                {label}
            </Text>
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: colors.surface,
                        borderColor: getBorderColor(),
                    },
                ]}
            >
                <Ionicons
                    name={getIcon()}
                    size={20}
                    color={isFocused ? colors.primary : colors.textMuted}
                    style={styles.icon}
                />
                <TextInput
                    style={[
                        styles.input,
                        { color: colors.text },
                    ]}
                    value={value}
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={type === 'password' && !showPassword}
                    keyboardType={type === 'email' ? 'email-address' : 'default'}
                    autoCapitalize={type === 'email' ? 'none' : 'sentences'}
                    autoCorrect={false}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {type === 'password' && value && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Text style={[styles.error, { color: colors.error }]}>
                    {error}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
        marginBottom: Spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        height: 52,
    },
    icon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: FontSizes.md,
        height: '100%',
    },
    eyeButton: {
        padding: Spacing.xs,
    },
    error: {
        fontSize: FontSizes.xs,
        marginTop: Spacing.xs,
    },
});
