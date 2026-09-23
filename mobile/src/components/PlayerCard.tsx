import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { PressableScale } from '@/components/motion';
import { colors, fonts, radius, shadow, spacing, themeForPosition, type as type_ } from '@/theme';
import type { Player } from '@/types';
import { formatHeight } from '@/utils/format';

type Props = {
  player: Player;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * The squad list item, built like a trading card: a gradient position panel
 * carrying the kit number on the left, the player's billing on the right, and
 * the three CRUD actions along the bottom edge.
 */
export function PlayerCard({ player, onView, onEdit, onDelete }: Props) {
  const tone = themeForPosition(player.position);

  return (
    <View style={styles.card}>
      <PressableScale
        onPress={onView}
        accessibilityRole="button"
        accessibilityLabel={`View ${player.full_name}`}
        style={styles.body}>
        <LinearGradient
          colors={[...tone.gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.panel}>
          <View>
            <Avatar
              name={player.full_name}
              position={player.position}
              photo={player.photo}
              size={54}
              ring
              onGradient
            />
            <View style={styles.jersey}>
              <Text style={[styles.jerseyText, { color: tone.ink }]}>{player.jersey_number}</Text>
            </View>
          </View>
          <Text style={styles.abbr}>{tone.abbr}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {player.full_name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {player.team} · {player.nationality}
          </Text>

          <View style={styles.rule} />

          <View style={styles.statRow}>
            <MiniStat label="Age" value={String(player.age)} />
            <MiniStat label="Height" value={formatHeight(player.height).toUpperCase()} />
            <MiniStat label="Foot" value={player.preferred_foot} />
          </View>
        </View>
      </PressableScale>

      <View style={styles.actions}>
        <CardAction icon="eye" label="View" onPress={onView} />
        <View style={styles.divider} />
        <CardAction icon="edit-2" label="Edit" onPress={onEdit} />
        <View style={styles.divider} />
        <CardAction icon="trash-2" label="Delete" onPress={onDelete} danger />
      </View>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function CardAction({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const tint = danger ? colors.danger : colors.textMuted;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
      <Feather name={icon} size={13} color={tint} />
      <Text style={[styles.actionLabel, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.card,
  },
  body: { flexDirection: 'row' },

  panel: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  jersey: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    minWidth: 26,
    height: 26,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jerseyText: { fontFamily: fonts.display, fontSize: 15, lineHeight: 26, letterSpacing: 0.4 },
  abbr: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 1.6,
    color: colors.white,
    opacity: 0.85,
  },

  content: { flex: 1, padding: spacing.md, paddingLeft: spacing.lg, justifyContent: 'center' },
  name: { ...type_.displayMd, color: colors.text, textTransform: 'uppercase' },
  meta: { ...type_.caption, color: colors.textMuted, marginTop: 1 },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  statRow: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, minWidth: 0 },
  statLabel: { ...type_.eyebrow, fontSize: 8.5, letterSpacing: 1.1, color: colors.textFaint },
  statValue: { ...type_.displaySm, color: colors.text, textTransform: 'uppercase', marginTop: 1 },

  actions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.field,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  actionPressed: { backgroundColor: colors.border },
  actionLabel: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
