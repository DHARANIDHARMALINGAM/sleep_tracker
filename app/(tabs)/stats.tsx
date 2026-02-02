/**
 * Stats Screen
 * 
 * Displays weekly sleep statistics with a visual chart.
 * Shows average sleep duration and sleep patterns.
 * 
 * Features:
 * - Bar chart showing daily sleep duration for the week
 * - Average sleep calculation
 * - Weekly summary statistics
 */

import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { formatDuration, useSleepStorage } from '@/hooks/useSleepStorage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
    const { colors, isDark } = useTheme();
    const { entries, loading, refresh, getWeeklyStats } = useSleepStorage();

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [])
    );

    const stats = getWeeklyStats();

    if (loading) {
        return <Loading message="Calculating statistics..." />;
    }

    // Empty state when no entries exist
    if (entries.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
                <EmptyState
                    title="No Statistics Yet"
                    message="Add some sleep entries to see your sleep patterns and statistics here."
                    icon="bar-chart-outline"
                />
            </SafeAreaView>
        );
    }

    // Chart configuration
    const chartConfig = {
        backgroundColor: colors.surface,
        backgroundGradientFrom: colors.surface,
        backgroundGradientTo: colors.surface,
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
        labelColor: () => colors.textSecondary,
        style: {
            borderRadius: BorderRadius.lg,
        },
        barPercentage: 0.6,
        propsForBackgroundLines: {
            stroke: colors.border,
            strokeWidth: 1,
        },
    };

    const chartData = {
        labels: stats.dayLabels,
        datasets: [
            {
                data: stats.dailyDurations.map(d => d || 0),
            },
        ],
    };

    // Calculate sleep quality indicator
    const getSleepQuality = (avg: number): { label: string; color: string; icon: string } => {
        if (avg >= 7 && avg <= 9) {
            return { label: 'Excellent', color: Colors.success, icon: 'happy' };
        } else if (avg >= 6 && avg < 7) {
            return { label: 'Good', color: Colors.primaryLight, icon: 'happy-outline' };
        } else if (avg >= 5 && avg < 6) {
            return { label: 'Fair', color: Colors.warning, icon: 'sad-outline' };
        } else {
            return { label: 'Poor', color: Colors.error, icon: 'sad' };
        }
    };

    const quality = getSleepQuality(stats.averageDuration);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Weekly Summary Cards */}
                <View style={styles.summaryGrid}>
                    {/* Average Sleep */}
                    <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight + '20' }]}>
                            <Ionicons name="time" size={24} color={colors.primary} />
                        </View>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>
                            {formatDuration(stats.averageDuration)}
                        </Text>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                            Avg. Sleep
                        </Text>
                    </View>

                    {/* Total Entries */}
                    <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.iconBadge, { backgroundColor: colors.accent + '20' }]}>
                            <Ionicons name="calendar" size={24} color={colors.accent} />
                        </View>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>
                            {stats.totalEntries}
                        </Text>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                            Total Entries
                        </Text>
                    </View>

                    {/* Sleep Quality */}
                    <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.iconBadge, { backgroundColor: quality.color + '20' }]}>
                            <Ionicons name={quality.icon as any} size={24} color={quality.color} />
                        </View>
                        <Text style={[styles.summaryValue, { color: quality.color }]}>
                            {quality.label}
                        </Text>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                            Sleep Quality
                        </Text>
                    </View>

                    {/* Recommended Sleep */}
                    <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.iconBadge, { backgroundColor: Colors.success + '20' }]}>
                            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                        </View>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>
                            7-9h
                        </Text>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                            Recommended
                        </Text>
                    </View>
                </View>

                {/* Weekly Chart */}
                <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.chartTitle, { color: colors.text }]}>
                        This Week's Sleep
                    </Text>
                    <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
                        Daily sleep duration in hours
                    </Text>

                    <BarChart
                        data={chartData}
                        width={screenWidth - Spacing.md * 4}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix="h"
                        chartConfig={chartConfig}
                        style={styles.chart}
                        fromZero
                        showValuesOnTopOfBars
                    />
                </View>

                {/* Tips Section */}
                <View style={[styles.tipsCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <View style={styles.tipsHeader}>
                        <Ionicons name="bulb" size={20} color={Colors.warning} />
                        <Text style={[styles.tipsTitle, { color: colors.text }]}>Sleep Tip</Text>
                    </View>
                    <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                        Adults need 7-9 hours of sleep per night for optimal health.
                        Maintain a consistent sleep schedule, even on weekends, to improve your sleep quality.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    summaryCard: {
        flex: 1,
        minWidth: '45%',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    summaryValue: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },
    summaryLabel: {
        fontSize: FontSizes.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chartCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginBottom: Spacing.lg,
    },
    chartTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    chartSubtitle: {
        fontSize: FontSizes.sm,
        marginBottom: Spacing.md,
    },
    chart: {
        marginVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    tipsCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginBottom: Spacing.lg,
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    tipsTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    tipsText: {
        fontSize: FontSizes.sm,
        lineHeight: 22,
    },
});
