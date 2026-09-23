import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { fieldStyles } from '@/components/FormField';
import { colors, fonts, radius, spacing, type as type_ } from '@/theme';

type Props<T extends string> = {
  label: string;
  value: T | '';
  options: readonly T[];
  onChange: (value: T) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
};

/**
 * Dropdown replacement. React Native has no styleable <select>, so tapping the
 * control opens a bottom sheet of options.
 */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  required,
  error,
  placeholder = 'Select',
}: Props<T>) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={fieldStyles.label}>
        {label}
        {required ? <Text style={fieldStyles.asterisk}> *</Text> : null}
      </Text>

      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}. Currently ${value || placeholder}`}
        style={({ pressed }) => [
          styles.control,
          !!error && fieldStyles.controlError,
          pressed && fieldStyles.controlFocused,
        ]}>
        <Text style={value ? styles.value : styles.placeholder} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={15} color={colors.textMuted} />
      </Pressable>

      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* Stops a tap inside the sheet from closing it. */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>{label}</Text>

            {options.map((option) => {
              const selected = option === value;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}>
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {option}
                  </Text>
                  <View style={[styles.check, selected && styles.checkOn]}>
                    {selected ? <Feather name="check" size={12} color={colors.white} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, marginBottom: spacing.lg },
  control: {
    ...fieldStyles.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  value: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, flexShrink: 1 },
  placeholder: { fontFamily: fonts.regular, fontSize: 14, color: colors.placeholder, flexShrink: 1 },

  backdrop: { flex: 1, backgroundColor: 'rgba(6,18,11,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    ...type_.displayMd,
    color: colors.text,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.xs,
  },
  optionSelected: { backgroundColor: colors.green100 },
  optionPressed: { backgroundColor: colors.field },
  optionLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  optionLabelSelected: { fontFamily: fonts.bold, color: colors.green900 },
  check: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.green600, borderColor: colors.green600 },
});
