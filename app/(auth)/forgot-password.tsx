/**
 * Forgot Password Screen
 * 
 * Allows users to request a password reset email.
 */

import { AuthInput } from '@/components/AuthInput';
import { Button } from '@/components/Button';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleResetPassword = async () => {
        setError('');

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setIsLoading(true);
            const { error: resetError } = await resetPassword(email);

            if (resetError) {
                setError(resetError.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.container}
            >
                <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                    <View style={styles.successContainer}>
                        <View style={[styles.successIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <Ionicons name="mail-outline" size={48} color="#FFFFFF" />
                        </View>
                        <Text style={styles.successTitle}>Check Your Email</Text>
                        <Text style={styles.successMessage}>
                            We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
                        </Text>
                        <Button
                            title="Back to Login"
                            onPress={() => router.replace('./login' as any)}
                            variant="secondary"
                            fullWidth
                            style={styles.backButton}
                        />
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name="key-outline" size={32} color="#FFFFFF" />
                            </View>
                            <Text style={styles.title}>Forgot Password?</Text>
                            <Text style={styles.subtitle}>
                                No worries! Enter your email and we'll send you a reset link.
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
                            {error ? (
                                <View style={[styles.errorBanner, { backgroundColor: colors.error + '20' }]}>
                                    <Ionicons name="alert-circle" size={20} color={colors.error} />
                                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                                </View>
                            ) : null}

                            <AuthInput
                                label="Email"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Button
                                title="Send Reset Link"
                                onPress={handleResetPassword}
                                variant="primary"
                                fullWidth
                                loading={isLoading}
                                style={styles.submitButton}
                            />

                            <Button
                                title="Back to Login"
                                onPress={() => router.back()}
                                variant="ghost"
                                fullWidth
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: Spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        paddingHorizontal: Spacing.lg,
    },
    formContainer: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
    },
    errorText: {
        flex: 1,
        fontSize: FontSizes.sm,
    },
    submitButton: {
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    successIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    successTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: Spacing.md,
    },
    successMessage: {
        fontSize: FontSizes.md,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: Spacing.xl,
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
});
