import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Reveal } from '@/components/motion';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { API_BASE_URL } from '@/config';
import { usePlayers } from '@/store/players';
import { colors, fonts, radius, shadow, spacing, type as type_ } from '@/theme';

type Operation = {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  body: string;
  tint: string;
  ink: string;
};

const OPERATIONS: Operation[] = [
  {
    icon: 'plus',
    title: 'Create',
    body: 'Add a new soccer player to your squad.',
    tint: '#DCFCE7',
    ink: '#15803D',
  },
  {
    icon: 'eye',
    title: 'Read',
    body: 'Browse all players and view individual details.',
    tint: '#DBEAFE',
    ink: '#1D4ED8',
  },
  {
    icon: 'edit-2',
    title: 'Update',
    body: 'Edit existing player information.',
    tint: '#FEF3C7',
    ink: '#B45309',
  },
  {
    icon: 'trash-2',
    title: 'Delete',
    body: 'Remove a player with confirmation.',
    tint: '#FEE2E2',
    ink: '#B91C1C',
  },
];

export default function AboutScreen() {
  const { status, players } = usePlayers();

  const connection =
    status === 'ready'
      ? {
          color: colors.green500,
          text: `Connected · ${players.length} ${players.length === 1 ? 'record' : 'records'} loaded`,
        }
      : status === 'loading'
        ? { color: colors.warning, text: 'Connecting…' }
        : { color: colors.danger, text: 'Not reachable — pull to refresh on the Squad tab' };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="About" subtitle="What this app is and what it talks to" />

      <ScrollView contentContainerStyle={styles.content}>
        <Reveal>
          <LinearGradient
            colors={[colors.ink, colors.green800]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="football" size={26} color={colors.white} />
            </View>
            <Text style={styles.heroTitle}>Soccer Player Manager</Text>
            <Text style={styles.heroBody}>
              A mobile CRUD application for managing soccer player information.
            </Text>
            <View style={styles.versionPill}>
              <Text style={styles.versionText}>Version 1.0</Text>
            </View>
          </LinearGradient>
        </Reveal>

        <Reveal delay={90} style={styles.block}>
          <SectionTitle title="App purpose" />
          <View style={styles.card}>
            <Text style={styles.cardBody}>
              This prototype demonstrates a mobile application for managing a squad of soccer
              players. It is built as a student project to showcase core mobile app development
              concepts with a clean, sporty interface.
            </Text>
          </View>
        </Reveal>

        <Reveal delay={140} style={styles.block}>
          <SectionTitle title="CRUD operations" />
          <View style={styles.card}>
            {OPERATIONS.map((operation, index) => (
              <View
                key={operation.title}
                style={[styles.operation, index === OPERATIONS.length - 1 && styles.operationLast]}>
                <View style={[styles.operationIcon, { backgroundColor: operation.tint }]}>
                  <Feather name={operation.icon} size={15} color={operation.ink} />
                </View>
                <View style={styles.operationText}>
                  <Text style={styles.operationTitle}>{operation.title}</Text>
                  <Text style={styles.operationBody}>{operation.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </Reveal>

        {/* Handy during a demo: shows at a glance that the phone is really
            talking to the hosted API rather than to local sample data. */}
        <Reveal delay={190} style={styles.block}>
          <SectionTitle title="Backend connection" />
          <View style={styles.card}>
            <Text style={styles.metaLabel}>API address</Text>
            <Text style={styles.metaValue} numberOfLines={2}>
              {API_BASE_URL}
            </Text>

            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: connection.color }]} />
              <Text style={styles.statusText}>{connection.text}</Text>
            </View>
          </View>
        </Reveal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },

  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.lifted,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.inkFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.inkLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    ...type_.displayLg,
    color: colors.white,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  heroBody: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.onInkMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  versionPill: {
    backgroundColor: colors.inkFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.inkLine,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  versionText: { ...type_.eyebrow, fontSize: 9.5, color: colors.lime },

  block: { marginTop: spacing.xl, gap: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardBody: { ...type_.body, color: colors.textMuted },

  operation: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  operationLast: { marginBottom: 0 },
  operationIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operationText: { flex: 1, gap: 1 },
  operationTitle: { ...type_.displaySm, color: colors.text, textTransform: 'uppercase' },
  operationBody: { ...type_.caption, color: colors.textMuted },

  metaLabel: { ...type_.eyebrow, fontSize: 9, color: colors.textFaint },
  metaValue: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.text, marginTop: 3 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  statusDot: { width: 8, height: 8, borderRadius: radius.pill },
  statusText: { flex: 1, ...type_.caption, color: colors.textMuted },
});
