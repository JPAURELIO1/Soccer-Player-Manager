import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View, type ColorValue } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type IconName = React.ComponentProps<typeof Feather>['name'];

/** Wraps the active icon in the light-green pill used in the prototype. */
function TabIcon({ name, color, focused }: { name: IconName; color: ColorValue; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Feather name={name} size={19} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green600,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.bar,
        tabBarItemStyle: styles.item,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Players',
          tabBarIcon: ({ color, focused }) => <TabIcon name="users" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add Player',
          tabBarIcon: ({ color, focused }) => <TabIcon name="user-plus" color={color} focused={focused} />,
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
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    height: 68,
    paddingTop: spacing.sm,
  },
  item: { paddingVertical: spacing.xs },
  label: { fontSize: 11, fontWeight: '600' },
  iconWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  iconWrapActive: { backgroundColor: colors.green100 },
});
