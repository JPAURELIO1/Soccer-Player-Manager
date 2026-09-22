import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayerForm } from '@/components/PlayerForm';
import { usePlayers } from '@/store/players';
import { colors } from '@/theme';
import { emptyPlayerForm, type PlayerFormValues } from '@/types';

export default function AddPlayerScreen() {
  const router = useRouter();
  const { create } = usePlayers();

  // Bumping the key remounts the form, which is the simplest way to clear
  // every field after a successful save.
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(values: PlayerFormValues) {
    const created = await create(values);

    setFormKey((key) => key + 1);
    // navigate, not push: this jumps to the existing Players tab rather than
    // stacking a second copy of it on top.
    router.navigate('/');

    Alert.alert('Player added', `${created.full_name} is now in your squad.`);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <PlayerForm
        key={formKey}
        title="Add Player"
        subtitle="Create a new player card"
        submitLabel="Save Player"
        initialValues={emptyPlayerForm}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.card },
});
