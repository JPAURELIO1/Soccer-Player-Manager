import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ApiError } from '@/api/client';
import { FormField } from '@/components/FormField';
import { PhotoPicker } from '@/components/PhotoPicker';
import { SelectField } from '@/components/SelectField';
import { colors, radius, spacing } from '@/theme';
import {
  POSITIONS,
  PREFERRED_FEET,
  type PlayerFormValues,
  type Position,
  type PreferredFoot,
} from '@/types';
import { validatePlayerForm, type FormErrors } from '@/utils/validation';

type Props = {
  title: string;
  subtitle: string;
  submitLabel: string;
  initialValues: PlayerFormValues;
  onSubmit: (values: PlayerFormValues) => Promise<void>;
  onCancel?: () => void;
};

/** The Add and Edit screens are the same form with different copy and handlers. */
export function PlayerForm({
  title,
  subtitle,
  submitLabel,
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] = useState<PlayerFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof PlayerFormValues>(key: K, value: PlayerFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    // Clear the error as soon as the user starts fixing that field.
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  }

  async function handleSubmit() {
    setFormError(null);

    const nextErrors = validatePlayerForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError) {
        // Surface any per-field messages the server caught that we did not.
        setErrors(error.fieldErrors as FormErrors);
        setFormError(error.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {formError ? (
          <View style={styles.banner}>
            <Feather name="alert-circle" size={15} color={colors.danger} />
            <Text style={styles.bannerText}>{formError}</Text>
          </View>
        ) : null}

        <FormField
          label="Full Name"
          required
          value={values.full_name}
          onChangeText={(text) => setField('full_name', text)}
          placeholder="e.g. Lionel Messi"
          autoCapitalize="words"
          error={errors.full_name}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <FormField
              label="Age"
              required
              value={values.age}
              onChangeText={(text) => setField('age', text.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 28"
              keyboardType="number-pad"
              maxLength={2}
              error={errors.age}
            />
          </View>
          <View style={styles.half}>
            <FormField
              label="Jersey Number"
              required
              value={values.jersey_number}
              onChangeText={(text) => setField('jersey_number', text.replace(/[^0-9]/g, ''))}
              placeholder="1-99"
              keyboardType="number-pad"
              maxLength={2}
              error={errors.jersey_number}
            />
          </View>
        </View>

        <FormField
          label="Nationality"
          required
          value={values.nationality}
          onChangeText={(text) => setField('nationality', text)}
          placeholder="e.g. Argentina"
          autoCapitalize="words"
          error={errors.nationality}
        />

        <FormField
          label="Team"
          required
          value={values.team}
          onChangeText={(text) => setField('team', text)}
          placeholder="e.g. Inter Miami"
          autoCapitalize="words"
          error={errors.team}
        />

        <View style={styles.row}>
          <SelectField<Position>
            label="Position"
            required
            value={values.position}
            options={POSITIONS}
            onChange={(option) => setField('position', option)}
            error={errors.position}
          />
          <SelectField<PreferredFoot>
            label="Preferred Foot"
            required
            value={values.preferred_foot}
            options={PREFERRED_FEET}
            onChange={(option) => setField('preferred_foot', option)}
            error={errors.preferred_foot}
          />
        </View>

        <FormField
          label="Height"
          required
          value={values.height}
          onChangeText={(text) => setField('height', text)}
          placeholder="e.g. 1.70 m"
          keyboardType="decimal-pad"
          error={errors.height}
        />

        <PhotoPicker value={values.photo} onChange={(photo) => setField('photo', photo)} />

        <FormField
          label="Description"
          required
          value={values.description}
          onChangeText={(text) => setField('description', text)}
          placeholder="Write player background, strengths or stats..."
          multiline
          numberOfLines={5}
          error={errors.description}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          accessibilityRole="button"
          style={({ pressed }) => [styles.submit, (pressed || submitting) && styles.dimmed]}>
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Feather name="check" size={16} color={colors.white} />
              <Text style={styles.submitLabel}>{submitLabel}</Text>
            </>
          )}
        </Pressable>

        {onCancel ? (
          <Pressable
            onPress={onCancel}
            disabled={submitting}
            accessibilityRole="button"
            style={styles.cancel}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2, marginBottom: spacing.xl },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.danger100,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerText: { flex: 1, color: colors.danger, fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  dimmed: { opacity: 0.8 },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.green600,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    minHeight: 50,
  },
  submitLabel: { color: colors.white, fontWeight: '700', fontSize: 15 },
  cancel: { alignItems: 'center', paddingVertical: spacing.lg },
  cancelLabel: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
});
