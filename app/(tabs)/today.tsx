/**
 * Today Screen
 * 
 * Main dashboard showing the most recent sleep entry.
 * Provides quick access to add a new sleep entry.
 * 
 * Features:
 * - Displays last sleep record with bedtime, wake time, and duration
 * - Shows recent sleep history
 * - Quick add button for new entries
 */

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { SleepCard } from '@/components/SleepCard';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { formatDuration, useSleepStorage } from '@/hooks/useSleepStorage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TodayScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { entries, loading, refresh, getLatestEntry, getWeeklyStats } = useSleepStorage();

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [])
    );

    const latestEntry = getLatestEntry();
    const stats = getWeeklyStats();

    // Handle add new entry
    const handleAddEntry = () => {
        router.push('/sleep/add');
    };

    // Handle view entry details
    const handleViewEntry = (id: string) => {
        router.push(`/sleep/${id}`);
    };

    if (loading) {
        return <Loading message="Loading your sleep data..." />;
    }

    // Empty state when no entries exist
    if (entries.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
                <EmptyState
                    title="No Sleep Data Yet"
                    message="Start tracking your sleep by adding your first entry. Sweet dreams await!"
                    icon="moon-outline"
                    actionLabel="Add First Entry"
                    onAction={handleAddEntry}
                />
            </SafeAreaView>
        );
    }

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
                {/* Quick Stats Banner */}
                <View style={[styles.statsBanner, { backgroundColor: colors.primary }]}>
                    <View style={styles.statsItem}>
                        <Text style={styles.statsValue}>{formatDuration(stats.averageDuration)}</Text>
                        <Text style={styles.statsLabel}>Avg. Sleep</Text>
                    </View>
                    <View style={styles.statsDivider} />
                    <View style={styles.statsItem}>
                        <Text style={styles.statsValue}>{stats.totalEntries}</Text>
                        <Text style={styles.statsLabel}>Total Entries</Text>
                    </View>
                </View>

                {/* Latest Entry Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Latest Sleep
                    </Text>
                    {latestEntry && (
                        <SleepCard
                            entry={latestEntry}
                            onPress={() => handleViewEntry(latestEntry.id)}
                        />
                    )}
                </View>

                {/* Recent History */}
                {entries.length > 1 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Recent History
                        </Text>
                        {entries.slice(1, 5).map((entry) => (
                            <View key={entry.id} style={styles.historyItem}>
                                <SleepCard
                                    entry={entry}
                                    onPress={() => handleViewEntry(entry.id)}
                                />
                            </View>
                        ))}
                    </View>
                )}

                {/* Add spacing at bottom */}
                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Floating Add Button */}
            <View style={styles.fabContainer}>
                <Button
                    title="Add Sleep"
                    onPress={handleAddEntry}
                    variant="primary"
                    size="large"
                    icon={<Ionicons name="add" size={24} color="#FFFFFF" />}
                    style={styles.fab}
                />
            </View>
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
    statsBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
    },
    statsItem: {
        alignItems: 'center',
    },
    statsValue: {
        color: '#FFFFFF',
        fontSize: FontSizes.xl,
        fontWeight: '700',
    },
    statsLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: FontSizes.sm,
        marginTop: Spacing.xs,
    },
    statsDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },
    historyItem: {
        marginBottom: Spacing.md,
    },
    bottomPadding: {
        height: 80,
    },
    fabContainer: {
        position: 'absolute',
        bottom: Spacing.lg,
        left: Spacing.lg,
        right: Spacing.lg,
    },
    fab: {
        borderRadius: BorderRadius.lg,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
