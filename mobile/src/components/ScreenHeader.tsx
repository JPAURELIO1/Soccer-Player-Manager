import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  /** The small "Soccer Player Manager" eyebrow above the title. */
  eyebrow?: string;
};

/** The green gradient banner that tops every tab screen. */
export function ScreenHeader({ title, subtitle, eyebrow = 'Soccer Player Manager' }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[colors.green800, colors.green600]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.eyebrowRow}>
        <Ionicons name="football" size={14} color={colors.green100} />
        <Text style={styles.eyebrow}>{eyebrow}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  eyebrow: { color: colors.green100, fontSize: 12, fontWeight: '600' },
  title: { color: colors.white, fontSize: 26, fontWeight: '800', marginTop: spacing.xs },
  subtitle: { color: colors.green100, fontSize: 12, marginTop: 2 },
});
