import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, themeForPosition } from '@/theme';
import { initialsOf } from '@/utils/format';

type Props = {
  name: string;
  position: string;
  photo?: string | null;
  size?: number;
  /** Adds the white keyline used when the avatar sits on a gradient. */
  ring?: boolean;
  /** Squared-off by default; pass true for the round hero treatment. */
  round?: boolean;
  /** Darkens the initials plate so it separates from a gradient behind it. */
  onGradient?: boolean;
};

/**
 * Shows the player's photo when there is one, otherwise a gradient plate with
 * the player's initials in the display face, tinted by their position.
 */
export function Avatar({
  name,
  position,
  photo,
  size = 56,
  ring = false,
  round = false,
  onGradient = false,
}: Props) {
  const tone = themeForPosition(position);
  const box = {
    width: size,
    height: size,
    borderRadius: round ? size / 2 : Math.round(size * 0.28),
  };
  const ringStyle = ring ? { borderWidth: Math.max(2, size * 0.035), borderColor: colors.white } : null;

  if (photo) {
    return (
      <View style={[box, ringStyle, styles.clip]}>
        <Image source={{ uri: photo }} style={styles.fill} contentFit="cover" transition={180} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={onGradient ? ['rgba(6,18,11,0.34)', 'rgba(6,18,11,0.10)'] : [...tone.gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[box, ringStyle, styles.initials]}>
      <Text style={[styles.initialsText, { fontSize: Math.round(size * 0.42) }]}>
        {initialsOf(name)}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden', backgroundColor: colors.field },
  fill: { width: '100%', height: '100%' },
  initials: { alignItems: 'center', justifyContent: 'center' },
  initialsText: {
    fontFamily: fonts.display,
    color: colors.white,
    letterSpacing: 1.5,
    // Bebas has no descenders to speak of; nudging it up centres it optically.
    marginTop: -1,
  },
});

/** Kept so callers can match the avatar's corner rounding. */
export const avatarRadius = radius.md;
