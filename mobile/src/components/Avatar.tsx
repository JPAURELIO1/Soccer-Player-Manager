import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { radius } from '@/theme';
import { themeForPosition } from '@/theme';
import { initialsOf } from '@/utils/format';

type Props = {
  name: string;
  position: string;
  photo?: string | null;
  size?: number;
};

/**
 * Shows the player's photo when there is one, otherwise the initials tile
 * from the design, tinted by the player's position.
 */
export function Avatar({ name, position, photo, size = 52 }: Props) {
  const tone = themeForPosition(position);
  const box = { width: size, height: size, borderRadius: radius.md };

  if (photo) {
    return <Image source={{ uri: photo }} style={box} contentFit="cover" transition={150} />;
  }

  return (
    <View style={[styles.initials, box, { backgroundColor: tone.solid }]}>
      <Text style={[styles.initialsText, { fontSize: size * 0.36 }]}>{initialsOf(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  initials: { alignItems: 'center', justifyContent: 'center' },
  initialsText: { color: '#FFFFFF', fontWeight: '700', letterSpacing: 0.5 },
});
