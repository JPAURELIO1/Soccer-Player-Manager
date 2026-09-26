import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import { findCountry, type Country } from '@/api/countries';
import { colors, fonts, radius, shadow, spacing, type as type_ } from '@/theme';
import { formatCompact, formatThousands } from '@/utils/format';

/**
 * Country facts from the third-party REST Countries API: the flag, the names,
 * and a grid of figures. Shared by the Player Card and the Nation screen.
 */
export function NationFacts({ country, onPress }: { country: Country; onPress?: () => void }) {
  const currency = country.currencies[0];
  const facts: { label: string; value: string }[] = [
    { label: 'Capital', value: country.capital ?? '—' },
    { label: 'Region', value: country.subregion ?? country.region },
    { label: 'Population', value: formatThousands(country.population) },
    {
      label: 'Area',
      value: country.areaKm ? `${formatCompact(country.areaKm)} km²` : '—',
    },
    { label: 'Languages', value: country.languages.slice(0, 3).join(', ') || '—' },
    {
      label: 'Currency',
      value: currency ? `${currency.name}${currency.symbol ? ` (${currency.symbol})` : ''}` : '—',
    },
  ];

  const body = (
    <>
      <View style={styles.head}>
        <Image
          source={{ uri: country.flagUrl }}
          style={styles.flag}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`Flag of ${country.name}`}
        />
        <View style={styles.headText}>
          <Text style={styles.name} numberOfLines={1}>
            {country.name}
          </Text>
          <Text style={styles.official} numberOfLines={2}>
            {country.officialName}
          </Text>
        </View>
        {country.fifa ? (
          <View style={styles.fifa}>
            <Text style={styles.fifaLabel}>FIFA</Text>
            <Text style={styles.fifaCode}>{country.fifa}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.grid}>
        {facts.map((fact) => (
          <View key={fact.label} style={styles.fact}>
            <Text style={styles.factLabel}>{fact.label}</Text>
            <Text style={styles.factValue} numberOfLines={2}>
              {fact.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Feather name="globe" size={11} color={colors.textFaint} />
        <Text style={styles.source}>Live from REST Countries</Text>
        {onPress ? (
          <View style={styles.more}>
            <Text style={styles.moreLabel}>More</Text>
            <Feather name="chevron-right" size={12} color={colors.green700} />
          </View>
        ) : null}
      </View>
    </>
  );

  if (!onPress) return <View style={styles.card}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {body}
    </Pressable>
  );
}

type LookupState =
  | { status: 'loading' }
  | { status: 'ready'; country: Country }
  | { status: 'missing' }
  | { status: 'error'; message: string };

/**
 * Looks up a player's typed nationality on REST Countries and shows the
 * result, with its own loading, not-found and error states so a slow or
 * failing third-party call never blocks the rest of the Player Card.
 */
export function PlayerNation({
  nationality,
  onOpen,
}: {
  nationality: string;
  onOpen?: (country: Country) => void;
}) {
  const [state, setState] = useState<LookupState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    findCountry(nationality)
      .then((country) => {
        if (!active) return;
        setState(country ? { status: 'ready', country } : { status: 'missing' });
      })
      .catch((err) => {
        if (!active) return;
        setState({
          status: 'error',
          message: err instanceof ApiError ? err.message : 'Could not load country details.',
        });
      });
    return () => {
      active = false;
    };
  }, [nationality, attempt]);

  if (state.status === 'ready') {
    const { country } = state;
    return <NationFacts country={country} onPress={onOpen ? () => onOpen(country) : undefined} />;
  }

  return (
    <View style={[styles.card, styles.placeholder]}>
      {state.status === 'loading' ? (
        <>
          <ActivityIndicator color={colors.green600} />
          <Text style={styles.placeholderText}>Fetching {nationality} from REST Countries…</Text>
        </>
      ) : state.status === 'missing' ? (
        <>
          <Feather name="help-circle" size={18} color={colors.textFaint} />
          <Text style={styles.placeholderText}>
            REST Countries has no country called “{nationality}”. Edit the player to use a country
            name such as “Brazil”.
          </Text>
        </>
      ) : (
        <>
          <Feather name="wifi-off" size={18} color={colors.danger} />
          <Text style={styles.placeholderText}>{state.message}</Text>
          <Pressable
            onPress={() => setAttempt((n) => n + 1)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
            <Feather name="refresh-cw" size={12} color={colors.white} />
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
  pressed: { opacity: 0.88 },

  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flag: {
    width: 64,
    height: 43,
    borderRadius: 6,
    backgroundColor: colors.field,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  headText: { flex: 1, gap: 1 },
  name: { ...type_.displayMd, color: colors.text, textTransform: 'uppercase' },
  official: { ...type_.caption, color: colors.textMuted },
  fifa: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  fifaLabel: { ...type_.eyebrow, fontSize: 7.5, letterSpacing: 1, color: colors.onInkFaint },
  fifaCode: {
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: 0.8,
    color: colors.lime,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    rowGap: spacing.md,
  },
  fact: { width: '50%', paddingRight: spacing.sm, gap: 2 },
  factLabel: { ...type_.eyebrow, fontSize: 8.5, color: colors.textFaint },
  factValue: { fontFamily: fonts.semibold, fontSize: 12.5, lineHeight: 17, color: colors.text },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.lg,
  },
  source: { flex: 1, ...type_.caption, fontSize: 10.5, color: colors.textFaint },
  more: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreLabel: { ...type_.eyebrow, fontSize: 9, color: colors.green700 },

  placeholder: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  placeholderText: { ...type_.caption, color: colors.textMuted, textAlign: 'center', maxWidth: 300 },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  retryLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.white,
  },
});
