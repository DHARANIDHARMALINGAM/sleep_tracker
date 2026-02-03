/**
 * Settings Screen
 * 
 * App settings and preferences.
 * 
 * Features:
 * - Dark mode toggle (UI only)
 * - Clear all sleep data with confirmation
 */

import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useSleepStorage } from '@/hooks/useSleepStorage';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const { colors, isDark, toggleTheme } = useTheme();
    const { signOut, user } = useAuth();
    const { clearAllData, entries } = useSleepStorage();
    const [isClearing, setIsClearing] = useState(false);

    /**
     * Handle clearing all sleep data
     * Shows a confirmation dialog before proceeding
     */
    const handleClearData = () => {
        if (entries.length === 0) {
            Alert.alert('No Data', 'There is no sleep data to clear.');
            return;
        }

        Alert.alert(
            'Clear All Data',
            `Are you sure you want to delete all ${entries.length} sleep entries? This action cannot be undone.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsClearing(true);
                            await clearAllData();
                            Alert.alert('Success', 'All sleep data has been cleared.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear sleep data. Please try again.');
                        } finally {
                            setIsClearing(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <View style={styles.content}>
                {/* Appearance Section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Appearance
                </Text>
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primaryLight }}
                            thumbColor={isDark ? colors.primary : colors.surface}
                        />
                    </View>
                </View>

                {/* Data Section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Data Management
                </Text>
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={handleClearData}
                        disabled={isClearing}
                    >
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: Colors.error + '20' }]}>
                                <Ionicons name="trash-outline" size={20} color={Colors.error} />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: Colors.error }]}>
                                    Clear All Data
                                </Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    {entries.length > 0
                                        ? `Delete all ${entries.length} sleep entries`
                                        : 'No sleep data to delete'}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Account Section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Account
                </Text>
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                                <Ionicons name="person-outline" size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Email</Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    {user?.email || 'Not signed in'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => {
                            Alert.alert(
                                'Sign Out',
                                'Are you sure you want to sign out?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Sign Out', style: 'destructive', onPress: signOut },
                                ]
                            );
                        }}
                    >
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: Colors.error + '20' }]}>
                                <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: Colors.error }]}>
                                    Sign Out
                                </Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    Sign out of your account
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    About
                </Text>
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Version</Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    1.0.0
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Ionicons name="moon" size={32} color={colors.primary} />
                    <Text style={[styles.footerText, { color: colors.textMuted }]}>
                        Sleep Tracker
                    </Text>
                    <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>
                        Track your sleep, improve your health
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
        marginTop: Spacing.md,
        marginLeft: Spacing.sm,
    },
    section: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: Spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabel: {
        fontSize: FontSizes.md,
        fontWeight: '500',
    },
    settingDescription: {
        fontSize: FontSizes.sm,
        marginTop: 2,
    },
    footer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: Spacing.xl,
        gap: Spacing.xs,
    },
    footerText: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        marginTop: Spacing.sm,
    },
    footerSubtext: {
        fontSize: FontSizes.sm,
    },
});
