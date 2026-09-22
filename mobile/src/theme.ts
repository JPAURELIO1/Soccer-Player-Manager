/**
 * Design tokens taken from the Figma prototype.
 * Everything visual should pull from here so the screens stay consistent.
 */

export const colors = {
  // Brand green, used for the header, primary buttons and the active tab.
  green900: '#14532D',
  green800: '#166534',
  green700: '#15803D',
  green600: '#16A34A',
  green100: '#DCFCE7',

  // Neutrals
  bg: '#F3F4F6',
  card: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',
  placeholder: '#9CA3AF',

  danger: '#DC2626',
  danger100: '#FEE2E2',
  white: '#FFFFFF',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 6, md: 10, lg: 14, pill: 999 } as const;

/** Each position gets its own accent, matching the coloured pills in the design. */
export const positionTheme = {
  Forward:    { solid: '#EF4444', tint: '#FEE2E2', ink: '#DC2626' },
  Midfielder: { solid: '#22C55E', tint: '#DCFCE7', ink: '#15803D' },
  Defender:   { solid: '#3B82F6', tint: '#DBEAFE', ink: '#2563EB' },
  Goalkeeper: { solid: '#F59E0B', tint: '#FEF3C7', ink: '#B45309' },
} as const;

/** Falls back to grey if the API ever returns a position we do not know. */
export function themeForPosition(position: string) {
  return (
    positionTheme[position as keyof typeof positionTheme] ?? {
      solid: '#6B7280',
      tint: '#F3F4F6',
      ink: '#4B5563',
    }
  );
}

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;
