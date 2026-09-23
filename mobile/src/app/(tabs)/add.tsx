import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { PlayerForm } from '@/components/PlayerForm';
import { ScreenHeader } from '@/components/ScreenHeader';
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
    // navigate, not push: this jumps to the existing Squad tab rather than
    // stacking a second copy of it on top.
    router.navigate('/');

    Alert.alert('Player signed', `${created.full_name} is now in your squad.`);
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Sign Player" subtitle="Add a new card to the squad" />
      <PlayerForm
        key={formKey}
        submitLabel="Save player"
        initialValues={emptyPlayerForm}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
});
