import { POSITIONS, PREFERRED_FEET, type PlayerFormValues } from '@/types';

export type FormErrors = Partial<Record<keyof PlayerFormValues, string>>;

/**
 * Client-side mirror of backend/validation.php.
 * Catching mistakes here saves a round trip; the server still re-checks,
 * because the API is also callable straight from Postman.
 */
export function validatePlayerForm(values: PlayerFormValues): FormErrors {
  const errors: FormErrors = {};

  const name = values.full_name.trim();
  if (!name) errors.full_name = 'Full name is required.';
  else if (name.length < 2 || name.length > 100) errors.full_name = 'Use between 2 and 100 characters.';

  const age = values.age.trim();
  if (!age) errors.age = 'Age is required.';
  else if (!/^\d+$/.test(age)) errors.age = 'Use whole numbers only.';
  else if (Number(age) < 15 || Number(age) > 60) errors.age = 'Age must be 15-60.';

  const jersey = values.jersey_number.trim();
  if (!jersey) errors.jersey_number = 'Jersey number is required.';
  else if (!/^\d+$/.test(jersey)) errors.jersey_number = 'Use whole numbers only.';
  else if (Number(jersey) < 1 || Number(jersey) > 99) errors.jersey_number = 'Must be 1-99.';

  if (!values.nationality.trim()) errors.nationality = 'Nationality is required.';
  if (!values.team.trim()) errors.team = 'Team is required.';

  if (!values.position) errors.position = 'Choose a position.';
  else if (!POSITIONS.includes(values.position)) errors.position = 'Choose a valid position.';

  if (!values.preferred_foot) errors.preferred_foot = 'Choose a preferred foot.';
  else if (!PREFERRED_FEET.includes(values.preferred_foot)) errors.preferred_foot = 'Choose a valid option.';

  // Accepts "1.70", "1,70" and "1.70 m" so a typed unit is not treated as an error.
  const heightRaw = values.height.trim();
  const height = Number(heightRaw.replace(',', '.').replace(/[^0-9.]/g, ''));
  if (!heightRaw) errors.height = 'Height is required.';
  else if (!Number.isFinite(height) || height === 0) errors.height = 'Enter a number in metres, e.g. 1.70.';
  else if (height < 1 || height > 2.5) errors.height = 'Height must be between 1.00 m and 2.50 m.';

  const description = values.description.trim();
  if (!description) errors.description = 'Description is required.';
  else if (description.length > 2000) errors.description = 'Keep it under 2000 characters.';

  return errors;
}
