import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import { getPlayer } from '@/api/players';
import { Avatar } from '@/components/Avatar';
import { PositionPill } from '@/components/PositionPill';
import { Reveal } from '@/components/motion';
import { SectionTitle } from '@/components/SectionTitle';
import { ErrorState, LoadingState } from '@/components/StateView';
import { usePlayers } from '@/store/players';
import { colors, fonts, radius, shadow, spacing, themeForPosition, type as type_ } from '@/theme';
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

  const tone = themeForPosition(player.position);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Reveal>
        <LinearGradient
          colors={[...tone.gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.jersey}>
              <Text style={styles.jerseyHash}>#</Text>
              {player.jersey_number}
            </Text>
            <PositionPill position={player.position} variant="ink" />
          </View>

          <Avatar
            name={player.full_name}
            position={player.position}
            photo={player.photo}
            size={116}
            ring
            round
            onGradient
          />

          <Text style={styles.name} numberOfLines={2}>
            {player.full_name}
          </Text>
          <Text style={styles.club}>
            {player.team} · {player.nationality}
          </Text>

          <View style={styles.heroStats}>
            <HeroStat label="Age" value={String(player.age)} />
            <View style={styles.heroDivider} />
            <HeroStat label="Height" value={formatHeight(player.height).toUpperCase()} />
            <View style={styles.heroDivider} />
            <HeroStat label="Foot" value={player.preferred_foot} />
          </View>
        </LinearGradient>
      </Reveal>

      <Reveal delay={100} style={styles.block}>
        <SectionTitle title="Scouting report" />
        <View style={styles.card}>
          <Text style={styles.description}>{player.description}</Text>
        </View>
      </Reveal>

      <Reveal delay={160} style={styles.actions}>
        <Pressable
          onPress={() => router.push(`/player/edit/${player.id}`)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.editButton, pressed && styles.pressed]}>
          <Feather name="edit-2" size={14} color={colors.white} />
          <Text style={styles.buttonLabel}>Edit player</Text>
        </Pressable>

        <Pressable
          onPress={confirmDelete}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.deleteButton, pressed && styles.pressed]}>
          <Feather name="trash-2" size={14} color={colors.danger} />
          <Text style={[styles.buttonLabel, { color: colors.danger }]}>Delete</Text>
        </Pressable>
      </Reveal>
    </ScrollView>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatLabel}>{label}</Text>
      <Text style={styles.heroStatValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },

  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadow.lifted,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginBottom: spacing.xs,
  },
  jersey: {
    fontFamily: fonts.display,
    fontSize: 46,
    lineHeight: 48,
    letterSpacing: 1,
    color: colors.white,
  },
  jerseyHash: { fontSize: 24, color: 'rgba(255,255,255,0.6)' },
  name: {
    ...type_.displayXl,
    color: colors.white,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  club: { fontFamily: fonts.medium, fontSize: 12.5, letterSpacing: 0.3, color: colors.onInkMuted },

  heroStats: {
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    marginTop: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.28)',
  },
  heroStat: { flex: 1, alignItems: 'center', gap: 2 },
  heroDivider: { width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.28)' },
  heroStatLabel: { ...type_.eyebrow, fontSize: 8.5, letterSpacing: 1.2, color: colors.onInkFaint },
  heroStatValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: 0.6,
    color: colors.white,
    textTransform: 'uppercase',
  },

  block: { marginTop: spacing.xl, gap: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
  description: { ...type_.body, color: colors.textMuted },

  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
  },
  editButton: { backgroundColor: colors.green600 },
  deleteButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  buttonLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.white,
  },
  pressed: { opacity: 0.85 },
});
