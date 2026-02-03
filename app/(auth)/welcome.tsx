/**
 * Welcome Screen
 * 
 * Landing page for unauthenticated users.
 * Features app branding and navigation to login/signup.
 */

import { Button } from '@/components/Button';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={styles.iconGradient}
                    >
                        <Ionicons name="moon" size={64} color="#FFFFFF" />
                    </LinearGradient>
                </View>

                <Text style={[styles.title, { color: colors.text }]}>
                    Sleep Tracker
                </Text>

                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Track your sleep patterns,{'\n'}improve your rest
                </Text>
            </View>

            {/* Features Section */}
            <View style={styles.featuresSection}>
                <FeatureItem
                    icon="analytics-outline"
                    title="Track Sleep Patterns"
                    description="Log your bedtime and wake time"
                    colors={colors}
                />
                <FeatureItem
                    icon="bar-chart-outline"
                    title="View Statistics"
                    description="Weekly charts and insights"
                    colors={colors}
                />
                <FeatureItem
                    icon="cloud-outline"
                    title="Sync Across Devices"
                    description="Your data, everywhere"
                    colors={colors}
                />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionSection}>
                <Button
                    title="Get Started"
                    onPress={() => router.push('/signup' as any)}
                    variant="primary"
                    size="large"
                    fullWidth
                />

                <Button
                    title="I already have an account"
                    onPress={() => router.push('/login' as any)}
                    variant="ghost"
                    size="large"
                    fullWidth
                />
            </View>
        </SafeAreaView>
    );
}

interface FeatureItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    colors: ReturnType<typeof useTheme>['colors'];
}

function FeatureItem({ icon, title, description, colors }: FeatureItemProps) {
    return (
        <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name={icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                    {title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textMuted }]}>
                    {description}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
    },
    heroSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Spacing.xxl,
    },
    iconContainer: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xs,
        marginBottom: Spacing.lg,
    },
    iconGradient: {
        width: 120,
        height: 120,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: FontSizes.hero,
        fontWeight: '700',
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSizes.lg,
        textAlign: 'center',
        lineHeight: 28,
    },
    featuresSection: {
        paddingVertical: Spacing.xl,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        marginBottom: 2,
    },
    featureDescription: {
        fontSize: FontSizes.sm,
    },
    actionSection: {
        paddingBottom: Spacing.xl,
        gap: Spacing.sm,
    },
});
