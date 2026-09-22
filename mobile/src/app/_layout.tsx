import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


import { PlayersProvider } from '@/store/players';
import { colors } from '@/theme';

/** The app is light-only, matching the prototype. */
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.green600,
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navigationTheme}>
        {/* One provider at the root means every screen reads the same squad,
            so a create or delete is reflected everywhere without a refetch. */}
        <PlayersProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.green700 },
              headerTintColor: colors.white,
              headerTitleStyle: { fontWeight: '700' },
              contentStyle: { backgroundColor: colors.bg },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="player/[id]" options={{ title: 'Player Details' }} />
            <Stack.Screen name="player/edit/[id]" options={{ title: 'Edit Player' }} />
          </Stack>
        </PlayersProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
