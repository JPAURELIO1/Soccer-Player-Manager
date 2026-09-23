import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ApiError } from '@/api/client';
import { getPlayer } from '@/api/players';
import { PlayerForm } from '@/components/PlayerForm';
import { ErrorState, LoadingState } from '@/components/StateView';
import { usePlayers } from '@/store/players';
import { colors } from '@/theme';
import { playerToForm, type PlayerFormValues } from '@/types';

export default function EditPlayerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const playerId = Number(id);

  const { getCached, update } = usePlayers();
  const cached = Number.isFinite(playerId) ? getCached(playerId) : undefined;

  const [initialValues, setInitialValues] = useState<PlayerFormValues | null>(
    cached ? playerToForm(cached) : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Only fetch when the player is not already in the store. We deliberately do
  // not re-seed the form afterwards: overwriting fields mid-edit would throw
  // away whatever the user had just typed.
  useEffect(() => {
    if (initialValues) return;

    if (!Number.isFinite(playerId)) {
      setError('That player id is not valid.');
      return;
    }

    const controller = new AbortController();
    getPlayer(playerId, controller.signal)
      .then((player) => {
        if (!controller.signal.aborted) {
          setInitialValues(playerToForm(player));
          setError(null);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Could not load this player.');
      });

    return () => controller.abort();
  }, [initialValues, playerId, attempt]);

  async function handleSubmit(values: PlayerFormValues) {
    const updated = await update(playerId, values);
    router.back();
    Alert.alert('Changes saved', `${updated.full_name} was updated.`);
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => setAttempt((n) => n + 1)} />;
  }
  if (!initialValues) {
    return <LoadingState label="Loading player…" />;
  }

  return (
    <View style={styles.screen}>
      <PlayerForm
        submitLabel="Save changes"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
});
