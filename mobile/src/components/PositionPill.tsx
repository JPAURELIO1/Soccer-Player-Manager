import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, themeForPosition } from '@/theme';

export function PositionPill({ position }: { position: string }) {
  const tone = themeForPosition(position);
  return (
    <View style={[styles.pill, { backgroundColor: tone.tint }]}>
      <Text style={[styles.label, { color: tone.ink }]}>{position}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 11, fontWeight: '700' },
});
