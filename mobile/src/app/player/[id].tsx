import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import { getPlayer } from '@/api/players';
import { Avatar } from '@/components/Avatar';
import { PositionPill } from '@/components/PositionPill';
import { ErrorState, LoadingState } from '@/components/StateView';
import { usePlayers } from '@/store/players';
import { colors, radius, shadow, spacing } from '@/theme';
import type { Player } from '@/types';
import { formatHeight } from '@/utils/format';

export default function PlayerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const playerId = Number(id);

  const { getCached, remove } = usePlayers();
  const cached = Number.isFinite(playerId) ? getCached(playerId) : undefined;

  const [player, setPlayer] = useState<Player | undefined>(cached);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // The cached copy renders instantly. We still fetch when there is none —
  // for example when this screen is opened from a deep link on a cold start.
  useEffect(() => {
    if (cached) {
      setPlayer(cached);
      setError(null);
      return;
    }
    if (!Number.isFinite(playerId)) {
      setError('That player id is not valid.');
      return;
    }

    const controller = new AbortController();
    getPlayer(playerId, controller.signal)
      .then((fetched) => {
        if (!controller.signal.aborted) {
          setPlayer(fetched);
          setError(null);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Could not load this player.');
      });

    return () => controller.abort();
  }, [cached, playerId, attempt]);

  function confirmDelete() {
    if (!player) return;
    Alert.alert('Delete player?', `${player.full_name} will be removed from the squad.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(player.id);
            router.back();
          } catch {
            Alert.alert('Could not delete', 'The server did not accept the request. Please try again.');
          }
        },
      },
    ]);
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => setAttempt((n) => n + 1)} />;
  }
  if (!player) {
    return <LoadingState label="Loading player…" />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Avatar name={player.full_name} position={player.position} photo={player.photo} size={88} />

        <View style={styles.heroText}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{player.full_name}</Text>
            <View style={styles.jersey}>
              <Text style={styles.jerseyText}>{player.jersey_number}</Text>
            </View>
          </View>
          <PositionPill position={player.position} />
          <Text style={styles.team}>{player.team}</Text>
        </View>
      </View>

      <View style={styles.statGrid}>
        <Stat label="Age" value={String(player.age)} />
        <Stat label="Height" value={formatHeight(player.height)} />
        <Stat label="Nationality" value={player.nationality} />
        <Stat label="Preferred Foot" value={player.preferred_foot} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Description</Text>
        <Text style={styles.description}>{player.description}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push(`/player/edit/${player.id}`)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.editButton, pressed && styles.pressed]}>
          <Feather name="edit-2" size={15} color={colors.white} />
          <Text style={styles.buttonLabel}>Edit Player</Text>
        </Pressable>

        <Pressable
          onPress={confirmDelete}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.deleteButton, pressed && styles.pressed]}>
          <Feather name="trash-2" size={15} color={colors.danger} />
          <Text style={[styles.buttonLabel, { color: colors.danger }]}>Delete</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  hero: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  heroText: { flex: 1, gap: spacing.sm, alignItems: 'flex-start' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flexShrink: 1, fontSize: 19, fontWeight: '800', color: colors.text },
  jersey: {
    backgroundColor: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  jerseyText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  team: { fontSize: 13, color: colors.textMuted },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stat: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadow.card,
  },
  statLabel: { fontSize: 11, fontWeight: '700', color: colors.textFaint, textTransform: 'uppercase' },
  statValue: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 3 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  description: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: spacing.md },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
  },
  editButton: { backgroundColor: colors.green600 },
  deleteButton: { backgroundColor: colors.danger100 },
  buttonLabel: { color: colors.white, fontWeight: '700', fontSize: 14 },
  pressed: { opacity: 0.8 },
});
