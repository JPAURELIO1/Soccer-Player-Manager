import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius, shadow, spacing, type as type_ } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  /** The small caps line above the title. */
  eyebrow?: string;
  /** Rendered at the right of the title row — a count chip, an action, etc. */
  trailing?: React.ReactNode;
};

/**
 * The ink slab that tops each screen. A dark band under the status bar with the
 * screen title set large in the display face — the masthead of the app.
 */
export function ScreenHeader({
  title,
  subtitle,
  eyebrow = 'Soccer Player Manager',
  trailing,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[colors.ink, colors.ink800]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
      {/* Oversized ball, bled off the corner, as a watermark. */}
      <Ionicons name="football" size={150} color={colors.white} style={styles.watermark} />

      <View style={styles.eyebrowRow}>
        <View style={styles.eyebrowRule} />
        <Text style={styles.eyebrow}>{eyebrow}</Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {trailing}
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.lifted,
  },
  watermark: {
    position: 'absolute',
    right: -34,
    top: -26,
    opacity: 0.07,
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eyebrowRule: { width: 18, height: 2, borderRadius: 2, backgroundColor: colors.lime },
  eyebrow: { ...type_.eyebrow, color: colors.lime },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  title: { ...type_.displayLg, flexShrink: 1, color: colors.white, textTransform: 'uppercase' },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
    color: colors.onInkMuted,
    marginTop: 3,
  },
});
