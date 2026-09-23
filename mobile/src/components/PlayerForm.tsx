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
import { SectionTitle } from '@/components/SectionTitle';
import { SelectField } from '@/components/SelectField';
import { colors, fonts, radius, shadow, spacing, type as type_ } from '@/theme';
import {
  POSITIONS,
  PREFERRED_FEET,
  type PlayerFormValues,
  type Position,
  type PreferredFoot,
} from '@/types';
import { validatePlayerForm, type FormErrors } from '@/utils/validation';

type Props = {
  submitLabel: string;
  initialValues: PlayerFormValues;
  onSubmit: (values: PlayerFormValues) => Promise<void>;
  onCancel?: () => void;
};

/**
 * The Add and Edit screens are the same form with different copy and handlers.
 * Fields are grouped into three cards so the sheet does not read as one long
 * column of inputs.
 */
export function PlayerForm({ submitLabel, initialValues, onSubmit, onCancel }: Props) {
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
        {formError ? (
          <View style={styles.banner}>
            <Feather name="alert-circle" size={15} color={colors.danger} />
            <Text style={styles.bannerText}>{formError}</Text>
          </View>
        ) : null}

        <SectionTitle title="Identity" />
        <View style={styles.card}>
          <FormField
            label="Full name"
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
                label="Jersey number"
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
        </View>

        <SectionTitle title="Club & role" />
        <View style={styles.card}>
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
              label="Preferred foot"
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
        </View>

        <SectionTitle title="Player profile" />
        <View style={styles.card}>
          <PhotoPicker value={values.photo} onChange={(photo) => setField('photo', photo)} />

          <FormField
            label="Description"
            required
            value={values.description}
            onChangeText={(text) => setField('description', text)}
            placeholder="Write player background, strengths or stats…"
            multiline
            numberOfLines={5}
            error={errors.description}
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          accessibilityRole="button"
          style={({ pressed }) => [styles.submit, (pressed || submitting) && styles.dimmed]}>
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Feather name="check" size={15} color={colors.white} />
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.danger100,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    padding: spacing.md,
  },
  bannerText: { flex: 1, ...type_.bodyStrong, fontSize: 12, color: colors.danger },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    // Each field carries its own bottom margin, which forms the card's inner
    // bottom padding — hence none here.
    paddingBottom: 0,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },

  dimmed: { opacity: 0.85 },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.green600,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    minHeight: 52,
    marginTop: spacing.md,
    ...shadow.card,
  },
  submitLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.white,
  },
  cancel: { alignItems: 'center', paddingVertical: spacing.lg },
  cancelLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
});
