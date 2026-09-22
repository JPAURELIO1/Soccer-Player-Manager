import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL } from '@/config';
import { usePlayers } from '@/store/players';
import { colors, radius, shadow, spacing } from '@/theme';

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
    ink: '#16A34A',
  },
  {
    icon: 'eye',
    title: 'Read',
    body: 'Browse all players and view individual details.',
    tint: '#DBEAFE',
    ink: '#2563EB',
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
    ink: '#DC2626',
  },
];

export default function AboutScreen() {
  const { status, players } = usePlayers();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={[colors.green800, colors.green600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="football" size={28} color={colors.white} />
          </View>
          <Text style={styles.heroTitle}>Soccer Player Manager</Text>
          <Text style={styles.heroBody}>
            A simple mobile CRUD application for managing soccer player information.
          </Text>
          <View style={styles.versionPill}>
            <Text style={styles.versionText}>Version 1.0</Text>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="info" size={16} color={colors.green600} />
            <Text style={styles.cardTitle}>App Purpose</Text>
          </View>
          <Text style={styles.cardBody}>
            This prototype demonstrates a basic mobile application for managing a squad of soccer
            players. It is built as a student project to showcase core mobile app development
            concepts with a clean, sporty interface.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardTitle, styles.cardTitleSolo]}>CRUD Operations</Text>
          {OPERATIONS.map((operation) => (
            <View key={operation.title} style={styles.operation}>
              <View style={[styles.operationIcon, { backgroundColor: operation.tint }]}>
                <Feather name={operation.icon} size={16} color={operation.ink} />
              </View>
              <View style={styles.operationText}>
                <Text style={styles.operationTitle}>{operation.title}</Text>
                <Text style={styles.operationBody}>{operation.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Handy during a demo: shows at a glance that the phone is really
            talking to the hosted API rather than to local sample data. */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="server" size={16} color={colors.green600} />
            <Text style={styles.cardTitle}>Backend Connection</Text>
          </View>

          <Text style={styles.metaLabel}>API address</Text>
          <Text style={styles.metaValue} numberOfLines={2}>
            {API_BASE_URL}
          </Text>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: status === 'ready' ? colors.green600 : status === 'loading' ? '#F59E0B' : colors.danger },
              ]}
            />
            <Text style={styles.statusText}>
              {status === 'ready'
                ? `Connected · ${players.length} ${players.length === 1 ? 'record' : 'records'} loaded`
                : status === 'loading'
                  ? 'Connecting…'
                  : 'Not reachable — pull to refresh on the Players tab'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { color: colors.white, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  heroBody: {
    color: colors.green100,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  versionPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  versionText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardTitleSolo: { marginBottom: spacing.lg },
  cardBody: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  operation: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  operationIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operationText: { flex: 1, gap: 2 },
  operationTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  operationBody: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  metaLabel: { fontSize: 11, fontWeight: '700', color: colors.textFaint, textTransform: 'uppercase' },
  metaValue: { fontSize: 12, color: colors.text, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  statusDot: { width: 8, height: 8, borderRadius: radius.pill },
  statusText: { flex: 1, fontSize: 12, color: colors.textMuted },
});
