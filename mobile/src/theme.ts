/**
 * Design tokens for the editorial "match programme" look.
 *
 * The visual language is three layers:
 *   1. ink    — near-black slabs that carry display type (headers, hero cards)
 *   2. paper  — the light canvas and white cards the content sits on
 *   3. accent — a position gradient that identifies each player at a glance
 *
 * Everything visual should pull from here so the screens stay consistent.
 */
import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  /** Ink — the dark editorial surfaces: headers, hero cards, jersey chips. */
  ink: '#06120B',
  ink900: '#0A1B11',
  ink800: '#112A1B',
  ink700: '#1A3D28',
  /** Hairlines and fills that sit on top of ink. */
  onInk: '#FFFFFF',
  onInkMuted: 'rgba(255,255,255,0.68)',
  onInkFaint: 'rgba(255,255,255,0.42)',
  inkLine: 'rgba(255,255,255,0.12)',
  inkFill: 'rgba(255,255,255,0.10)',

  // Brand green, used for primary actions and the active tab.
  green900: '#14532D',
  green800: '#166534',
  green700: '#15803D',
  green600: '#16A34A',
  green500: '#22C55E',
  green100: '#DCFCE7',
  /** Electric touch-line accent. Used sparingly, on ink only. */
  lime: '#C7F464',

  // Paper — the light canvas and the cards on it.
  bg: '#EDF0EE',
  /** The ground behind the centred app column in a desktop browser. */
  ground: '#D3DBD6',
  card: '#FFFFFF',
  field: '#F5F7F6',
  border: '#E1E6E3',
  text: '#0B1710',
  textMuted: '#5D6B62',
  textFaint: '#94A19A',
  placeholder: '#A7B2AB',

  danger: '#DC2626',
  danger100: '#FEE2E2',
  warning: '#F59E0B',
  white: '#FFFFFF',
} as const;

/**
 * Two families do all the work: a condensed display face for names, numbers
 * and titles, and Inter for everything you actually have to read.
 * Keys match the font names registered in app/_layout.tsx.
 */
export const fonts = {
  display: 'BebasNeue_400Regular',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

/**
 * Display type is condensed, so it wants generous letter-spacing and a line
 * height close to its size. These presets keep that consistent.
 */
export const type = {
  /** Hero name on the player card. */
  displayXl: { fontFamily: fonts.display, fontSize: 40, lineHeight: 42, letterSpacing: 1.2 },
  /** Screen titles in the ink header. */
  displayLg: { fontFamily: fonts.display, fontSize: 32, lineHeight: 34, letterSpacing: 1 },
  /** Player name in a list card, section titles. */
  displayMd: { fontFamily: fonts.display, fontSize: 23, lineHeight: 25, letterSpacing: 0.7 },
  /** Stat figures. */
  displaySm: { fontFamily: fonts.display, fontSize: 18, lineHeight: 20, letterSpacing: 0.6 },

  /** The all-caps micro label above a value or section. */
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  /** Button and tab labels. */
  action: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
  body: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 20 },
  caption: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

/**
 * react-native-web draws a browser focus ring inside text inputs, which fights
 * the border we draw ourselves. Spread this into any input style.
 */
export const noFocusRing = (Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as TextStyle;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 } as const;

/**
 * Each position gets its own two-stop gradient, which is what makes a player
 * card readable from across the room.
 *   gradient — the card panel and hero
 *   tint/ink — the light pill used on white surfaces
 *   abbr     — the three-letter code stamped on the card
 */
export const positionTheme = {
  Forward: {
    gradient: ['#7F1D1D', '#EF4444'],
    solid: '#EF4444',
    tint: '#FEE2E2',
    ink: '#B91C1C',
    abbr: 'FWD',
  },
  Midfielder: {
    gradient: ['#064E3B', '#22C55E'],
    solid: '#22C55E',
    tint: '#DCFCE7',
    ink: '#15803D',
    abbr: 'MID',
  },
  Defender: {
    gradient: ['#1E3A8A', '#3B82F6'],
    solid: '#3B82F6',
    tint: '#DBEAFE',
    ink: '#1D4ED8',
    abbr: 'DEF',
  },
  Goalkeeper: {
    gradient: ['#78350F', '#F59E0B'],
    solid: '#F59E0B',
    tint: '#FEF3C7',
    ink: '#B45309',
    abbr: 'GK',
  },
} as const;

export type PositionTone = {
  gradient: readonly [string, string];
  solid: string;
  tint: string;
  ink: string;
  abbr: string;
};

/** Falls back to grey if the API ever returns a position we do not know. */
export function themeForPosition(position: string): PositionTone {
  return (
    (positionTheme[position as keyof typeof positionTheme] as PositionTone) ?? {
      gradient: ['#374151', '#6B7280'] as const,
      solid: '#6B7280',
      tint: '#F1F3F2',
      ink: '#4B5563',
      abbr: '—',
    }
  );
}

/**
 * Shadows are written per platform: the web build wants `boxShadow` (React
 * Native for Web deprecated the `shadow*` props), while Android still needs
 * `elevation` to render anything at all.
 */
function depth(web: string, native: ViewStyle): ViewStyle {
  return Platform.OS === 'web' ? ({ boxShadow: web } as ViewStyle) : native;
}

export const shadow = {
  /** Resting white card. */
  card: depth('0 1px 2px rgba(6,18,11,0.04), 0 10px 24px -16px rgba(6,18,11,0.20)', {
    shadowColor: colors.ink,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  }),
  /** Hero cards and the ink header, which sit above everything else. */
  lifted: depth('0 18px 40px -20px rgba(6,18,11,0.45)', {
    shadowColor: colors.ink,
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  }),
} as const;
