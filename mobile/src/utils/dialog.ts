import { Alert, Platform } from 'react-native';

/**
 * react-native-web ships Alert.alert as an empty function, so in the browser a
 * delete confirmation would silently never appear. These wrappers fall back to
 * the browser's own dialogs there and use the native Alert everywhere else.
 */

/** A one-button message. */
export function notify(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

/** A Cancel / destructive-action prompt. `onConfirm` runs only on confirm. */
export function confirmDestructive(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void,
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
