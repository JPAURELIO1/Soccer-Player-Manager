import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, noFocusRing, radius, spacing, type as type_ } from '@/theme';

type Props = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
};

/**
 * Labelled text input. The border carries the state: grey at rest, green while
 * focused, red once the field has failed validation.
 */
export function FormField({ label, required, error, hint, style, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.asterisk}> *</Text> : null}
      </Text>

      <TextInput
        placeholderTextColor={colors.placeholder}
        {...inputProps}
        onFocus={(event) => {
          setFocused(true);
          inputProps.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          inputProps.onBlur?.(event);
        }}
        style={[
          styles.input,
          inputProps.multiline && styles.multiline,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          style,
        ]}
      />

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

/** Shared so SelectField and PhotoPicker label themselves identically. */
export const fieldStyles = StyleSheet.create({
  label: { ...type_.eyebrow, color: colors.textMuted, marginBottom: 7 },
  asterisk: { color: colors.danger },
  error: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 15,
    color: colors.danger,
    marginTop: 5,
  },
  control: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.field,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  controlFocused: { borderColor: colors.green600, backgroundColor: colors.white },
  controlError: { borderColor: colors.danger, backgroundColor: colors.white },
});

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: fieldStyles.label,
  asterisk: fieldStyles.asterisk,
  input: {
    ...fieldStyles.control,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    ...noFocusRing,
  },
  inputFocused: fieldStyles.controlFocused,
  inputError: fieldStyles.controlError,
  multiline: { minHeight: 104, paddingTop: spacing.md, textAlignVertical: 'top' },
  error: fieldStyles.error,
  hint: { ...type_.caption, color: colors.textFaint, marginTop: 5 },
});
