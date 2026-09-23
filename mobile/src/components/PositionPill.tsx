import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing, themeForPosition } from '@/theme';

type Props = {
  position: string;
  /** `paper` sits on white cards, `ink` on a gradient or dark slab. */
  variant?: 'paper' | 'ink';
  /** Uses the three-letter code (FWD, MID…) instead of the full word. */
  short?: boolean;
};

export function PositionPill({ position, variant = 'paper', short = false }: Props) {
  const tone = themeForPosition(position);
  const onInk = variant === 'ink';

  return (
    <View style={[styles.pill, onInk ? styles.pillInk : { backgroundColor: tone.tint }]}>
      <View style={[styles.dot, { backgroundColor: onInk ? colors.white : tone.solid }]} />
      <Text style={[styles.label, { color: onInk ? colors.white : tone.ink }]}>
        {short ? tone.abbr : position}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  pillInk: {
    backgroundColor: colors.inkFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.inkLine,
  },
  dot: { width: 5, height: 5, borderRadius: radius.pill },
  label: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
