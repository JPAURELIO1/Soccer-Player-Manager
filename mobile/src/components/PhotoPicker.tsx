import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { fieldStyles } from '@/components/FormField';
import { colors, radius, spacing } from '@/theme';

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
        Alert.alert(
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
        Alert.alert('Could not read that image', 'Please try a different picture.');
        return;
      }

      const mime = asset.mimeType ?? 'image/jpeg';
      onChange(`data:${mime};base64,${asset.base64}`);
    } catch {
      Alert.alert('Could not open the photo library', 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={fieldStyles.label}>Player Picture</Text>

      <View style={styles.row}>
        <View style={styles.preview}>
          {value ? (
            <Image source={{ uri: value }} style={styles.previewImage} contentFit="cover" />
          ) : (
            <Ionicons name="football" size={26} color={colors.white} />
          )}
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={pick}
            disabled={busy}
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, (pressed || busy) && { opacity: 0.7 }]}>
            <Feather name="image" size={14} color={colors.white} />
            <Text style={styles.buttonLabel}>{value ? 'Change Picture' : 'Add Picture'}</Text>
          </Pressable>

          {value ? (
            <Pressable onPress={() => onChange(null)} accessibilityRole="button" style={styles.remove}>
              <Text style={styles.removeLabel}>Remove</Text>
            </Pressable>
          ) : null}

          <Text style={styles.hint}>Optional — leave blank to use an auto avatar</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  preview: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.green700,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  controls: { flex: 1, gap: spacing.xs, alignItems: 'flex-start' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.green600,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  buttonLabel: { color: colors.white, fontWeight: '700', fontSize: 13 },
  remove: { paddingVertical: 2 },
  removeLabel: { color: colors.danger, fontSize: 12, fontWeight: '600' },
  hint: { fontSize: 11, color: colors.textFaint },
});
