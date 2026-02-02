/**
 * Tab Layout
 * 
 * Bottom tab navigator with three tabs:
 * - Today: Home screen showing the latest sleep entry
 * - Stats: Weekly sleep statistics and charts
 * - Settings: App preferences and data management
 */

import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        // Tab bar styling
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        // Header styling
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      {/* Today Tab - Main screen */}
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          headerTitle: 'Sleep Tracker',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="moon" size={size} color={color} />
          ),
        }}
      />

      {/* Stats Tab - Weekly statistics */}
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          headerTitle: 'Sleep Statistics',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />

      {/* Settings Tab - App preferences */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />

      {/* Hide index from tab bar (redirect to today) */}
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
