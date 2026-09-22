import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

/** Full-screen spinner used while the first load is in flight. */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.green600} />
      <Text style={styles.body}>{label}</Text>
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
      <View style={[styles.iconCircle, { backgroundColor: colors.danger100 }]}>
        <Feather name="wifi-off" size={22} color={colors.danger} />
      </View>
      <Text style={styles.title}>Cannot reach the server</Text>
      <Text style={styles.body}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          style={({ pressed }) => [styles.retry, pressed && { opacity: 0.8 }]}>
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
      <View style={[styles.iconCircle, { backgroundColor: colors.green100 }]}>
        <Feather name="users" size={22} color={colors.green600} />
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
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  body: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19 },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.green600,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  retryLabel: { color: colors.white, fontWeight: '700', fontSize: 13 },
});
