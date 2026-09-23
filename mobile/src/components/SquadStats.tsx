import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { Reveal } from '@/components/motion';
import { SectionTitle } from '@/components/SectionTitle';
import { colors, fonts, positionTheme, radius, shadow, spacing, type as type_ } from '@/theme';
import { POSITIONS, type Player } from '@/types';

const RING_SIZE = 108;
const RING_STROKE = 14;

/**
 * The overview strip above the squad list. Everything here is derived from the
 * players the API already returned, so it costs no extra request.
 */
export function SquadStats({ players }: { players: Player[] }) {
  const summary = useMemo(() => {
    const total = players.length;
    const sum = (pick: (player: Player) => number) => players.reduce((acc, p) => acc + pick(p), 0);

    return {
      total,
      averageAge: total ? sum((p) => p.age) / total : 0,
      averageHeight: total ? sum((p) => Number(p.height)) / total : 0,
      nations: new Set(players.map((p) => p.nationality.trim().toLowerCase())).size,
      byPosition: POSITIONS.map((position) => ({
        position,
        count: players.filter((p) => p.position === position).length,
      })),
    };
  }, [players]);

  if (summary.total === 0) return null;

  return (
    <Reveal style={styles.wrapper}>
      <SectionTitle title="Squad Overview" />

      <View style={styles.tileRow}>
        <Tile label="Avg age" value={summary.averageAge.toFixed(1)} />
        <Tile label="Avg height" value={`${summary.averageHeight.toFixed(2)}m`} />
        <Tile label="Nations" value={String(summary.nations)} />
      </View>

      <View style={styles.breakdown}>
        <PositionRing total={summary.total} slices={summary.byPosition} />

        <View style={styles.legend}>
          {summary.byPosition.map(({ position, count }) => (
            <View key={position} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: positionTheme[position].solid }]} />
              <Text style={styles.legendLabel} numberOfLines={1}>
                {position}
              </Text>
              <Text style={styles.legendCount}>{count}</Text>
            </View>
          ))}
        </View>
      </View>
    </Reveal>
  );
}

/**
 * Donut chart of the squad's shape. Each position becomes one arc, drawn by
 * dashing a circle and offsetting where that dash starts.
 */
function PositionRing({
  total,
  slices,
}: {
  total: number;
  slices: { position: (typeof POSITIONS)[number]; count: number }[];
}) {
  const r = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * r;
  const centre = RING_SIZE / 2;

  let consumed = 0;

  return (
    <View style={styles.ringWrap}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        {/* Rotated so the first arc begins at twelve o'clock. */}
        <G transform={`rotate(-90, ${centre}, ${centre})`}>
          <Circle
            cx={centre}
            cy={centre}
            r={r}
            stroke={colors.field}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          {slices
            .filter((slice) => slice.count > 0)
            .map((slice) => {
              const length = (slice.count / total) * circumference;
              const offset = consumed;
              consumed += length;

              return (
                <Circle
                  key={slice.position}
                  cx={centre}
                  cy={centre}
                  r={r}
                  stroke={positionTheme[slice.position].solid}
                  strokeWidth={RING_STROKE}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  fill="none"
                />
              );
            })}
        </G>
      </Svg>

      <View style={styles.ringCentre} pointerEvents="none">
        <Text style={styles.ringValue}>{total}</Text>
        <Text style={styles.ringLabel}>{total === 1 ? 'Player' : 'Players'}</Text>
      </View>
    </View>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const card = {
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.border,
  ...shadow.card,
} as const;

const styles = StyleSheet.create({
  wrapper: { gap: spacing.md, marginBottom: spacing.xl },

  tileRow: { flexDirection: 'row', gap: spacing.md },
  tile: { ...card, flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  tileLabel: { ...type_.eyebrow, fontSize: 9, letterSpacing: 1.1, color: colors.textFaint },
  tileValue: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 0.6,
    color: colors.text,
    textTransform: 'uppercase',
  },

  breakdown: {
    ...card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  ringWrap: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  ringCentre: { position: 'absolute', alignItems: 'center' },
  ringValue: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: 0.5,
    color: colors.text,
  },
  ringLabel: { ...type_.eyebrow, fontSize: 8.5, letterSpacing: 1.2, color: colors.textFaint },

  legend: { flex: 1, gap: spacing.sm },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendDot: { width: 8, height: 8, borderRadius: radius.pill },
  legendLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  legendCount: {
    fontFamily: fonts.display,
    fontSize: 17,
    letterSpacing: 0.4,
    color: colors.text,
    minWidth: 18,
    textAlign: 'right',
  },
});
