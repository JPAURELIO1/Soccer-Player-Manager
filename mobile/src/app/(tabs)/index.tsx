import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

import { PlayerCard } from '@/components/PlayerCard';
import { Reveal } from '@/components/motion';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { SquadStats } from '@/components/SquadStats';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateView';
import { usePlayers } from '@/store/players';
import { colors, fonts, noFocusRing, radius, shadow, spacing, type as type_ } from '@/theme';
import type { Player } from '@/types';

export default function PlayersScreen() {
  const router = useRouter();
  const { players, status, error, refreshing, refresh, remove } = usePlayers();
  const [search, setSearch] = useState('');
  const term = search.trim();

  // Filtered locally: the squad is small, so this stays instant as you type.
  // The API also supports ?search= — see the Postman collection.
  const visible = useMemo(() => {
    const needle = term.toLowerCase();
    if (!needle) return players;
    return players.filter((player) =>
      [player.full_name, player.team, player.position, player.nationality]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [players, term]);

  function confirmDelete(player: Player) {
    Alert.alert(
      'Delete player?',
      `${player.full_name} will be removed from the squad. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(player.id);
            } catch {
              Alert.alert('Could not delete', 'The server did not accept the request. Please try again.');
            }
          },
        },
      ],
    );
  }

  const subtitle =
    status === 'ready'
      ? term
        ? `${visible.length} of ${players.length} shown`
        : `${players.length} ${players.length === 1 ? 'player' : 'players'} under contract`
      : undefined;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Squad"
        subtitle={subtitle}
        trailing={
          status === 'ready' ? (
            <View style={styles.countChip}>
              <Text style={styles.countValue}>{players.length}</Text>
            </View>
          ) : null
        }
      />

      <View style={styles.searchWrap}>
        <Feather name="search" size={15} color={colors.textFaint} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, team, or position"
          placeholderTextColor={colors.placeholder}
          style={styles.searchInput}
          autoCorrect={false}
          returnKeyType="search"
        />
        {search ? (
          <Pressable
            onPress={() => setSearch('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}>
            <Feather name="x" size={15} color={colors.textFaint} />
          </Pressable>
        ) : null}
      </View>

      {status === 'loading' ? (
        <LoadingState label="Loading your squad…" />
      ) : status === 'error' ? (
        <ErrorState message={error ?? 'Unknown error.'} onRetry={() => refresh()} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(player) => String(player.id)}
          contentContainerStyle={visible.length === 0 ? styles.emptyContent : styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => refresh({ silent: true })}
              tintColor={colors.green600}
              colors={[colors.green600]}
            />
          }
          ListHeaderComponent={
            visible.length === 0 ? null : (
              <>
                {/* Hidden while searching, so the results stay the focus. */}
                {term ? null : <SquadStats players={players} />}
                <SectionTitle title={term ? 'Search results' : 'Player cards'} />
                <View style={styles.headerGap} />
              </>
            )
          }
          renderItem={({ item, index }) => (
            // The stagger is capped so a long list does not crawl in.
            <Reveal delay={Math.min(index, 6) * 55}>
              <PlayerCard
                player={item}
                onView={() => router.push(`/player/${item.id}`)}
                onEdit={() => router.push(`/player/edit/${item.id}`)}
                onDelete={() => confirmDelete(item)}
              />
            </Reveal>
          )}
          ListEmptyComponent={
            term ? (
              <EmptyState
                title="No matches"
                body={`Nothing in your squad matches “${term}”. Try a different name, team, or position.`}
              />
            ) : (
              <EmptyState
                title="No players yet"
                body="Your squad is empty. Use the Sign tab to put your first player under contract."
              />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },

  countChip: {
    minWidth: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(199,244,100,0.45)',
    alignItems: 'center',
  },
  countValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: 0.5,
    color: colors.lime,
  },

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

  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerGap: { height: spacing.md },
  emptyContent: { flexGrow: 1 },
});
