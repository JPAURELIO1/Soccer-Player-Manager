import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius, spacing } from '@/theme';

type IconName = React.ComponentProps<typeof Feather>['name'];

/** Wraps the active icon in the lime pill that marks the current tab. */
function TabIcon({ name, color, focused }: { name: IconName; color: ColorValue; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Feather name={name} size={18} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.onInkFaint,
        tabBarLabelStyle: styles.label,
        // The bar is a dark slab, so it needs the safe-area inset added to its
        // own height rather than relying on the default translucent treatment.
        tabBarStyle: [styles.bar, { height: 62 + insets.bottom, paddingBottom: insets.bottom }],
        tabBarItemStyle: styles.item,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Squad',
          tabBarIcon: ({ color, focused }) => <TabIcon name="users" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Sign',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="user-plus" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="nations"
        options={{
          title: 'Nations',
          tabBarIcon: ({ color, focused }) => <TabIcon name="globe" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, focused }) => <TabIcon name="info" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.ink,
    borderTopWidth: 0,
    paddingTop: spacing.sm,
  },
  item: { paddingVertical: 2 },
  label: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  iconWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  iconWrapActive: { backgroundColor: 'rgba(199,244,100,0.15)' },
});
