/**
 * Root Layout
 * 
 * The root layout for the Sleep Tracker app.
 * Sets up the theme provider, auth provider, loads fonts, and configures navigation.
 * 
 * Navigation Structure:
 * - (auth): Authentication screens (welcome, login, signup) for unauthenticated users
 * - (tabs): Bottom tab navigator with Today, Stats, Settings for authenticated users
 * - sleep/add: Modal for adding new sleep entries
 * - sleep/[id]: Dynamic route for viewing/editing sleep entry details
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}

/**
 * Root Navigation Setup
 * 
 * Configures conditionally based on auth state:
 * - Unauthenticated: Shows auth screens (welcome/login/signup)
 * - Authenticated: Shows main app with tabs
 */
function RootLayoutNav() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {/* Auth screens for unauthenticated users */}
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
          redirect={isAuthenticated}
        />

        {/* Main tab navigator - for authenticated users */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
          redirect={!isAuthenticated}
        />

        {/* Add sleep entry modal */}
        <Stack.Screen
          name="sleep/add"
          options={{
            presentation: 'modal',
            title: 'Add Sleep',
            headerStyle: {
              backgroundColor: colors.surface,
            },
          }}
        />

        {/* Sleep entry detail screen */}
        <Stack.Screen
          name="sleep/[id]"
          options={{
            title: 'Sleep Details',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  );
}
