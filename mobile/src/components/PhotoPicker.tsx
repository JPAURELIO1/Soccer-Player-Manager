import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fieldStyles } from '@/components/FormField';
import { colors, fonts, radius, spacing, type as type_ } from '@/theme';
import { notify } from '@/utils/dialog';

type Props = {
  value: string | null;
  onChange: (dataUri: string | null) => void;
};

/**
 * Picks an image and hands back a base64 data URI, which is what the API
 * stores. Quality is deliberately low: the whole image travels inside the
 * JSON body, so a full-resolution photo would make every request enormous.
 */
export function PhotoPicker({ value, onChange }: Props) {
  const [busy, setBusy] = useState(false);

  async function pick() {
    setBusy(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        notify(
          'Permission needed',
          'Allow photo access in Settings to attach a player picture, or leave it blank to use an initials avatar.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        notify('Could not read that image', 'Please try a different picture.');
        return;
      }

      const mime = asset.mimeType ?? 'image/jpeg';
      onChange(`data:${mime};base64,${asset.base64}`);
    } catch {
      notify('Could not open the photo library', 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={fieldStyles.label}>Player picture</Text>

      <View style={styles.row}>
        <LinearGradient
          colors={[colors.ink800, colors.green700]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.preview}>
          {value ? (
            <Image source={{ uri: value }} style={styles.previewImage} contentFit="cover" />
          ) : (
            <Ionicons name="football" size={26} color="rgba(255,255,255,0.85)" />
          )}
        </LinearGradient>

        <View style={styles.controls}>
          <Pressable
            onPress={pick}
            disabled={busy}
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, (pressed || busy) && { opacity: 0.75 }]}>
            <Feather name="image" size={13} color={colors.white} />
            <Text style={styles.buttonLabel}>{value ? 'Change picture' : 'Add picture'}</Text>
          </Pressable>

          {value ? (
            <Pressable onPress={() => onChange(null)} accessibilityRole="button" hitSlop={6}>
              <Text style={styles.removeLabel}>Remove</Text>
            </Pressable>
          ) : (
            <Text style={styles.hint}>Optional — an initials card is used instead</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  preview: {
    width: 76,
    height: 76,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  controls: { flex: 1, gap: spacing.sm, alignItems: 'flex-start' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  buttonLabel: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.white,
  },
  removeLabel: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.danger,
  },
  hint: { ...type_.caption, color: colors.textFaint },
});
