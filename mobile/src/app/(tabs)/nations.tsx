import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ApiError } from '@/api/client';
import { searchCountries, type Country } from '@/api/countries';
import { Reveal } from '@/components/motion';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { EmptyState } from '@/components/StateView';
import { usePlayers } from '@/store/players';
import { colors, fonts, noFocusRing, radius, shadow, spacing, type as type_ } from '@/theme';
import { formatCompact } from '@/utils/format';

/** Wait this long after the last keystroke before calling the API. */
const DEBOUNCE_MS = 350;

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; results: Country[] }
  | { status: 'error'; message: string };

/**
 * The third-party API tab: a live search over REST Countries. Each keystroke
 * (debounced) is a GET request; tapping a result opens its Nation screen.
 */
export default function NationsScreen() {
  const router = useRouter();
  const { players } = usePlayers();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  const [attempt, setAttempt] = useState(0);
  const term = query.trim();

  useEffect(() => {
    if (!term) {
      setState({ status: 'idle' });
      return;
    }

    setState({ status: 'loading' });
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchCountries(term, controller.signal)
        .then((results) => {
          if (!controller.signal.aborted) setState({ status: 'ready', results });
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          setState({
            status: 'error',
            message: err instanceof ApiError ? err.message : 'Could not search countries.',
          });
        });
    }, DEBOUNCE_MS);

    // A newer keystroke cancels both the pending timer and any request in flight.
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, attempt]);

  // Quick picks: every nation already in the squad, most common first.
  const squadNations = useMemo(() => {
    const counts = new Map<string, number>();
    for (const player of players) {
      const name = player.nationality.trim();
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [players]);

  const results = state.status === 'ready' ? state.results : [];

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Nations"
        subtitle="Live country data from the REST Countries API"
        trailing={
          <View style={styles.apiChip}>
            <Feather name="globe" size={12} color={colors.lime} />
            <Text style={styles.apiChipLabel}>API</Text>
          </View>
        }
      />

      <View style={styles.searchWrap}>
        <Feather name="search" size={15} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search any country, e.g. Brazil"
          placeholderTextColor={colors.placeholder}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
        />
        {state.status === 'loading' ? (
          <ActivityIndicator size="small" color={colors.green600} />
        ) : query ? (
          <Pressable
            onPress={() => setQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}>
            <Feather name="x" size={15} color={colors.textFaint} />
          </Pressable>
        ) : null}
      </View>

      {state.status === 'idle' ? (
        <View style={styles.content}>
          <Reveal style={styles.block}>
            <SectionTitle title="Your squad's nations" />
            {squadNations.length === 0 ? (
              <Text style={styles.hint}>Sign a player and their nation will show up here.</Text>
            ) : (
              <View style={styles.chips}>
                {squadNations.map(([name, count]) => (
                  <Pressable
                    key={name}
                    onPress={() => setQuery(name)}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}>
                    <Text style={styles.chipLabel}>{name}</Text>
                    <View style={styles.chipCount}>
                      <Text style={styles.chipCountLabel}>{count}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </Reveal>

          <Reveal delay={80} style={styles.block}>
            <View style={styles.infoCard}>
              <Feather name="info" size={15} color={colors.green700} />
              <Text style={styles.infoText}>
                Type a country name to search the REST Countries API. Results come back live with
                flags, capitals, population, languages and currencies.
              </Text>
            </View>
          </Reveal>
        </View>
      ) : state.status === 'error' ? (
        <View style={styles.errorWrap}>
          <View style={styles.errorIcon}>
            <Feather name="wifi-off" size={20} color={colors.danger} />
          </View>
          <Text style={styles.errorText}>{state.message}</Text>
          <Pressable
            onPress={() => setAttempt((n) => n + 1)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.retry, pressed && { opacity: 0.85 }]}>
            <Feather name="refresh-cw" size={13} color={colors.white} />
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(country) => country.code}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            state.status === 'ready' && results.length === 0 ? styles.emptyContent : styles.listContent
          }
          ListHeaderComponent={
            results.length ? (
              <View style={styles.listHeader}>
                <SectionTitle
                  title={`${results.length} ${results.length === 1 ? 'country' : 'countries'}`}
                />
              </View>
            ) : null
          }
          renderItem={({ item, index }) => (
            <Reveal delay={Math.min(index, 6) * 45}>
              <Pressable
                onPress={() => router.push(`/nation/${item.code}`)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
                <Image source={{ uri: item.flagUrl }} style={styles.flag} contentFit="cover" />
                <View style={styles.rowText}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {[item.capital, item.subregion ?? item.region].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <View style={styles.rowStat}>
                  <Text style={styles.rowStatValue}>{formatCompact(item.population)}</Text>
                  <Text style={styles.rowStatLabel}>People</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.textFaint} />
              </Pressable>
            </Reveal>
          )}
          ListEmptyComponent={
            state.status === 'ready' ? (
              <EmptyState
                title="No countries"
                body={`REST Countries has nothing matching “${term}”. Try another spelling.`}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },

  apiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(199,244,100,0.45)',
  },
  apiChipLabel: { ...type_.eyebrow, fontSize: 9, color: colors.lime },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.card,
  },
  searchInput: {
    flex: 1,
    ...type_.body,
    color: colors.text,
    padding: 0,
    ...noFocusRing,
  },

  content: { paddingHorizontal: spacing.lg },
  block: { marginTop: spacing.xl, gap: spacing.md },
  hint: { ...type_.body, color: colors.textMuted },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingLeft: spacing.md,
    paddingRight: 5,
    paddingVertical: 5,
    ...shadow.card,
  },
  chipLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text },
  chipCount: {
    minWidth: 20,
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  chipCountLabel: { fontFamily: fonts.bold, fontSize: 10, color: colors.lime },

  infoCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.green100,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  infoText: { flex: 1, ...type_.caption, fontSize: 12, lineHeight: 18, color: colors.green900 },

  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  listHeader: { marginBottom: spacing.xs },
  emptyContent: { flexGrow: 1 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadow.card,
  },
  flag: {
    width: 48,
    height: 32,
    borderRadius: 5,
    backgroundColor: colors.field,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowText: { flex: 1, gap: 1 },
  rowName: { ...type_.displaySm, color: colors.text, textTransform: 'uppercase' },
  rowMeta: { ...type_.caption, color: colors.textMuted },
  rowStat: { alignItems: 'flex-end' },
  rowStatValue: { ...type_.displaySm, color: colors.text },
  rowStatLabel: { ...type_.eyebrow, fontSize: 8, color: colors.textFaint },

  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  errorIcon: {
    width: 50,
    height: 50,
    borderRadius: radius.lg,
    backgroundColor: colors.danger100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { ...type_.body, color: colors.textMuted, textAlign: 'center', maxWidth: 320 },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  retryLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.white,
  },
});
