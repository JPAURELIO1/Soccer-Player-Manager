import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { PlayersProvider } from '@/store/players';
import { colors, fonts } from '@/theme';

// Held open until the display faces are ready, so no screen flashes in the
// system font and then reflows.
SplashScreen.preventAutoHideAsync().catch(() => {});

/** The app is light-only, with dark ink slabs doing the contrast work. */
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.ink,
    text: colors.text,
    border: colors.border,
    primary: colors.green600,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BebasNeue_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    // Hide on error too: a missing font is no reason to strand the user on the
    // splash screen, the system face is a perfectly usable fallback.
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* On a desktop browser the app sits in a centred column: a phone layout
          stretched across a monitor reads as a mistake. No effect on device. */}
      <View style={styles.shell}>
      <ThemeProvider value={navigationTheme}>
        {/* One provider at the root means every screen reads the same squad,
            so a create or delete is reflected everywhere without a refetch. */}
        <PlayersProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.ink },
              headerTintColor: colors.white,
              headerShadowVisible: false,
              // React Navigation only accepts font family/size/weight here.
              // Bebas Neue is uppercase-only, so no transform is needed.
              headerTitleStyle: { fontFamily: fonts.display, fontSize: 21 },
              contentStyle: { backgroundColor: colors.bg },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="player/[id]" options={{ title: 'Player Card' }} />
            <Stack.Screen name="player/edit/[id]" options={{ title: 'Edit Player' }} />
            <Stack.Screen name="nation/[code]" options={{ title: 'Nation' }} />
          </Stack>
        </PlayersProvider>
      </ThemeProvider>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? colors.ground : colors.bg,
  },
  shell: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.bg,
    ...Platform.select({
      web: { maxWidth: 560, alignSelf: 'center' },
      default: {},
    }),
  },
});
