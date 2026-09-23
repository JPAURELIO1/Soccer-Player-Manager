import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type as type_ } from '@/theme';

/** The all-caps label and rule used between blocks of a screen. */
export function SectionTitle({ title, trailing }: { title: string; trailing?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rule} />
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { ...type_.eyebrow, color: colors.textMuted },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
