import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PlayerCard } from '@/components/PlayerCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateView';
import { usePlayers } from '@/store/players';
import { colors, radius, shadow, spacing } from '@/theme';
import type { Player } from '@/types';

export default function PlayersScreen() {
  const router = useRouter();
  const { players, status, error, refreshing, refresh, remove } = usePlayers();
  const [search, setSearch] = useState('');

  // Filtered locally: the squad is small, so this stays instant as you type.
  // The API also supports ?search= — see the Postman collection.
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return players;
    return players.filter((player) =>
      [player.full_name, player.team, player.position, player.nationality]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [players, search]);

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
      ? search.trim()
        ? `${visible.length} of ${players.length} shown`
        : `${players.length} ${players.length === 1 ? 'player' : 'players'} in your squad`
      : undefined;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Players" subtitle={subtitle} />

      <View style={styles.searchWrap}>
        <Feather name="search" size={15} color={colors.textFaint} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, team, or position..."
          placeholderTextColor={colors.placeholder}
          style={styles.searchInput}
          autoCorrect={false}
          returnKeyType="search"
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search">
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
          renderItem={({ item }) => (
            <PlayerCard
              player={item}
              onView={() => router.push(`/player/${item.id}`)}
              onEdit={() => router.push(`/player/edit/${item.id}`)}
              onDelete={() => confirmDelete(item)}
            />
          )}
          ListEmptyComponent={
            search.trim() ? (
              <EmptyState
                title="No matches"
                body={`Nothing in your squad matches “${search.trim()}”. Try a different name, team, or position.`}
              />
            ) : (
              <EmptyState
                title="No players yet"
                body="Your squad is empty. Use the Add Player tab to sign your first player."
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    ...shadow.card,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text, padding: 0 },
  listContent: { padding: spacing.lg },
  emptyContent: { flexGrow: 1 },
});
