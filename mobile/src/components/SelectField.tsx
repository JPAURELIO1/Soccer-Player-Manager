import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { fieldStyles } from '@/components/FormField';
import { colors, radius, spacing } from '@/theme';

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
        style={({ pressed }) => [styles.control, !!error && styles.controlError, pressed && { opacity: 0.7 }]}>
        <Text style={value ? styles.value : styles.placeholder}>{value || placeholder}</Text>
        <Feather name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* Stops a tap inside the sheet from closing it. */}
          <Pressable style={styles.sheet} onPress={() => {}}>
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
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{option}</Text>
                  {selected ? <Feather name="check" size={16} color={colors.green600} /> : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
  },
  controlError: { borderColor: colors.danger },
  value: { fontSize: 14, color: colors.text },
  placeholder: { fontSize: 14, color: colors.placeholder },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sheetTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionPressed: { backgroundColor: colors.bg },
  optionLabel: { fontSize: 15, color: colors.text },
  optionLabelSelected: { fontWeight: '700', color: colors.green700 },
});
