/**
 * Login Screen
 * 
 * Email/Password login form with error handling.
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

export default function LoginScreen() {
    const { colors } = useTheme();
    const { signIn } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validate = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const { error } = await signIn(email.trim(), password);
            if (error) {
                Alert.alert('Login Failed', error.message);
            }
            // Navigation happens automatically via auth state change
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
                            Welcome back
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Sign in to continue tracking your sleep
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
                            placeholder="Enter your password"
                            error={errors.password}
                        />

                        <TouchableOpacity
                            onPress={() => router.push('./forgot-password' as any)}
                            style={styles.forgotPassword}
                        >
                            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        <Button
                            title={loading ? 'Signing in...' : 'Sign In'}
                            onPress={handleLogin}
                            variant="primary"
                            size="large"
                            fullWidth
                            disabled={loading}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footerSection}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Don't have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => router.replace('/signup' as any)}>
                            <Text style={[styles.footerLink, { color: colors.primary }]}>
                                Sign Up
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -Spacing.xs,
        marginBottom: Spacing.sm,
    },
    forgotPasswordText: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
    },
});
