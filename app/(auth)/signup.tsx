/**
 * Sign Up Screen
 * 
 * Email/Password signup form with validation.
 */

import { AuthInput } from '@/components/AuthInput';
import { Button } from '@/components/Button';
import { FontSizes, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
    const { colors } = useTheme();
    const { signUp } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const validate = (): boolean => {
        const newErrors: typeof errors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const { error } = await signUp(email.trim(), password);
            if (error) {
                Alert.alert('Sign Up Failed', error.message);
            } else {
                Alert.alert(
                    'Account Created',
                    'Please check your email to verify your account, then sign in.',
                    [{ text: 'OK', onPress: () => router.replace('/login' as any) }]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerSection}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Create account
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Start tracking your sleep today
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formSection}>
                        <AuthInput
                            label="Email"
                            type="email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            error={errors.email}
                        />

                        <AuthInput
                            label="Password"
                            type="password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Create a password"
                            error={errors.password}
                        />

                        <AuthInput
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm your password"
                            error={errors.confirmPassword}
                        />

                        <Button
                            title={loading ? 'Creating account...' : 'Create Account'}
                            onPress={handleSignUp}
                            variant="primary"
                            size="large"
                            fullWidth
                            disabled={loading}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footerSection}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => router.replace('/login' as any)}>
                            <Text style={[styles.footerLink, { color: colors.primary }]}>
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.lg,
    },
    backButton: {
        marginTop: Spacing.md,
        padding: Spacing.sm,
        marginLeft: -Spacing.sm,
        alignSelf: 'flex-start',
    },
    headerSection: {
        marginTop: Spacing.xl,
        marginBottom: Spacing.xxl,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSizes.md,
        lineHeight: 24,
    },
    formSection: {
        gap: Spacing.sm,
    },
    footerSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingVertical: Spacing.xl,
    },
    footerText: {
        fontSize: FontSizes.md,
    },
    footerLink: {
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
});
