/**
 * Root Layout
 * 
 * The root layout for the Sleep Tracker app.
 * Sets up the theme provider, loads fonts, and configures the navigation stack.
 * 
 * Navigation Structure:
 * - (tabs): Bottom tab navigator with Today, Stats, Settings
 * - sleep/add: Modal for adding new sleep entries
 * - sleep/[id]: Dynamic route for viewing/editing sleep entry details
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
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
      <RootLayoutNav />
    </ThemeProvider>
  );
}

/**
 * Root Navigation Setup
 * 
 * Configures the Stack navigator with:
 * - Tab navigator as the main content
 * - Modal presentation for add sleep screen
 * - Detail screen for individual entries
 */
function RootLayoutNav() {
  const { colors, isDark } = useTheme();

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
        {/* Main tab navigator - no header since tabs have their own */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

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
