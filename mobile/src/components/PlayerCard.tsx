import { Feather, Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { PositionPill } from '@/components/PositionPill';
import { colors, radius, shadow, spacing } from '@/theme';
import type { Player } from '@/types';
import { subtitleFor } from '@/utils/format';

type Props = {
  player: Player;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function PlayerCard({ player, onView, onEdit, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <Pressable
        onPress={onView}
        accessibilityRole="button"
        accessibilityLabel={`View ${player.full_name}`}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}>
        <Avatar name={player.full_name} position={player.position} photo={player.photo} />

        <View style={styles.details}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {player.full_name}
            </Text>
            <View style={styles.jersey}>
              <Text style={styles.jerseyText}>{player.jersey_number}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <PositionPill position={player.position} />
            <Text style={styles.team} numberOfLines={1}>
              {player.team}
            </Text>
          </View>

          <Text style={styles.subtitle}>{subtitleFor(player)}</Text>
        </View>
      </Pressable>

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
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <Feather name={icon} size={14} color={tint} />
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
    ...shadow.card,
  },
  body: { flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  pressed: { opacity: 0.6 },
  details: { flex: 1, gap: spacing.xs },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flexShrink: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  jersey: {
    backgroundColor: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 22,
    alignItems: 'center',
  },
  jerseyText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  team: { flexShrink: 1, fontSize: 12, color: colors.textMuted },
  subtitle: { fontSize: 11, color: colors.textFaint },
  actions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  actionLabel: { fontSize: 12, fontWeight: '600' },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
