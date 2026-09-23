import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing, type as type_ } from '@/theme';

/** Full-screen spinner used while the first load is in flight. */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.green600} />
      <Text style={[styles.body, { marginTop: spacing.md }]}>{label}</Text>
    </View>
  );
}

/**
 * Shown when the API is unreachable. The message comes from ApiError, which
 * already explains the likely cause, so it is worth showing verbatim.
 */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconTile, { backgroundColor: colors.danger100 }]}>
        <Feather name="wifi-off" size={22} color={colors.danger} />
      </View>
      <Text style={styles.title}>Cannot reach the server</Text>
      <Text style={styles.body}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          style={({ pressed }) => [styles.retry, pressed && { opacity: 0.85 }]}>
          <Feather name="refresh-cw" size={14} color={colors.white} />
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconTile, { backgroundColor: colors.green100 }]}>
        <Feather name="users" size={22} color={colors.green700} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconTile: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...type_.displayMd,
    color: colors.text,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  body: { ...type_.body, color: colors.textMuted, textAlign: 'center', maxWidth: 320 },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
  },
  retryLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.white,
  },
});
