import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import { getCountryByCode, isNationalityOf, type Country } from '@/api/countries';
import { Avatar } from '@/components/Avatar';
import { Reveal } from '@/components/motion';
import { NationFacts } from '@/components/NationCard';
import { PositionPill } from '@/components/PositionPill';
import { SectionTitle } from '@/components/SectionTitle';
import { ErrorState, LoadingState } from '@/components/StateView';
import { usePlayers } from '@/store/players';
import { colors, radius, shadow, spacing, type as type_ } from '@/theme';

/** One country from REST Countries, plus the squad players who represent it. */
export default function NationScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { players } = usePlayers();

  const [country, setCountry] = useState<Country | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    getCountryByCode(String(code), controller.signal)
      .then((found) => {
        if (!controller.signal.aborted) setCountry(found);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Could not load this country.');
      });
    return () => controller.abort();
  }, [code, attempt]);

  // Joins the two APIs: our squad (PHP) filtered by this country (REST Countries).
  const squad = useMemo(
    () => (country ? players.filter((p) => isNationalityOf(p.nationality, country)) : []),
    [players, country],
  );

  if (error) return <ErrorState message={error} onRetry={() => setAttempt((n) => n + 1)} />;
  if (!country) return <LoadingState label="Loading country…" />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: country.name }} />

      <Reveal>
        <NationFacts country={country} />
      </Reveal>

      <Reveal delay={90} style={styles.block}>
        <SectionTitle title="Timezones" />
        <View style={styles.chips}>
          {country.timezones.map((zone) => (
            <View key={zone} style={styles.chip}>
              <Text style={styles.chipLabel}>{zone}</Text>
            </View>
          ))}
        </View>
      </Reveal>

      <Reveal delay={140} style={styles.block}>
        <SectionTitle title={`Squad players · ${squad.length}`} />
        {squad.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.empty}>
              Nobody in your squad is from {country.name} yet.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            {squad.map((player, index) => (
              <Pressable
                key={player.id}
                onPress={() => router.push(`/player/${player.id}`)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.player,
                  index > 0 && styles.playerDivider,
                  pressed && { opacity: 0.8 },
                ]}>
                <Avatar name={player.full_name} position={player.position} photo={player.photo} size={40} />
                <View style={styles.playerText}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {player.full_name}
                  </Text>
                  <Text style={styles.playerMeta} numberOfLines={1}>
                    #{player.jersey_number} · {player.team}
                  </Text>
                </View>
                <PositionPill position={player.position} short />
                <Feather name="chevron-right" size={16} color={colors.textFaint} />
              </Pressable>
            ))}
          </View>
        )}
      </Reveal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  block: { marginTop: spacing.xl, gap: spacing.md },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  chipLabel: { ...type_.caption, color: colors.textMuted },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadow.card,
  },
  empty: { ...type_.body, color: colors.textMuted, paddingVertical: spacing.sm },

  player: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  playerDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  playerText: { flex: 1, gap: 1 },
  playerName: { ...type_.displaySm, color: colors.text, textTransform: 'uppercase' },
  playerMeta: { ...type_.caption, color: colors.textMuted },
});
