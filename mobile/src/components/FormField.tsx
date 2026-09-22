import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Props = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
};

/** Labelled text input with the red asterisk and inline error from the design. */
export function FormField({ label, required, error, hint, style, ...inputProps }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.asterisk}> *</Text> : null}
      </Text>

      <TextInput
        placeholderTextColor={colors.placeholder}
        {...inputProps}
        style={[styles.input, inputProps.multiline && styles.multiline, !!error && styles.inputError, style]}
      />

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

export const fieldStyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 6 },
  asterisk: { color: colors.danger },
  error: { fontSize: 11, color: colors.danger, marginTop: 4 },
});

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: fieldStyles.label,
  asterisk: fieldStyles.asterisk,
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: fieldStyles.error,
  hint: { fontSize: 11, color: colors.textFaint, marginTop: 4 },
});
