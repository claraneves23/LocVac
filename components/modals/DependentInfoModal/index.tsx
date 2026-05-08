import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FamilyMember } from '../../../app/types/vaccination';
import { colors, radii, spacing, typography, shadows } from '../../../app/theme/tokens';
import { Avatar } from '../../redesign';

const formatDateToBR = (isoDate: string | undefined): string => {
  if (!isoDate) return '—';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const formatSex = (sex: string) => {
  if (sex === 'M') return 'Masculino';
  if (sex === 'F') return 'Feminino';
  return 'Outro';
};

type InfoRowProps = { label: string; value?: string };
function InfoRow({ label, value }: InfoRowProps) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

type DependentInfoModalProps = {
  visible: boolean;
  dependent: FamilyMember | null;
  onClose: () => void;
};

export default function DependentInfoModal({ visible, dependent, onClose }: DependentInfoModalProps) {
  if (!dependent) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <StatusBar style="light" backgroundColor={colors.dimDark} translucent />
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.kicker}>Dependente</Text>
              <Text style={styles.title}>Dados completos</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.ink2} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarSection}>
              <Avatar name={dependent.name} photoUri={dependent.photoUri} size={84} tone="brand" />
              <Text style={styles.dependentName}>{dependent.name}</Text>
              {dependent.relationship && (
                <View style={styles.relationshipPill}>
                  <Text style={styles.relationshipText}>{dependent.relationship}</Text>
                </View>
              )}
            </View>

            <View style={styles.infoCard}>
              <InfoRow label="Nascimento" value={formatDateToBR(dependent.birthDate)} />
              <InfoRow label="Sexo" value={formatSex(dependent.sex)} />
              <InfoRow label="Local de nascimento" value={dependent.birthPlace} />
              <InfoRow label="Responsável" value={dependent.guardianName} />
              <InfoRow label="CNS" value={dependent.cns} />
              <InfoRow label="Telefone" value={dependent.phone} />
              <InfoRow label="CEP" value={dependent.zipCode} />
              <InfoRow label="Rua" value={dependent.address} />
              <InfoRow label="Complemento" value={dependent.complement} />
              <InfoRow label="Município" value={dependent.city} />
              <InfoRow label="Estado" value={dependent.state} />
            </View>
          </ScrollView>

          <Pressable style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.dimDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    backgroundColor: colors.bgElev,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  kicker: {
    ...typography.caption,
    color: colors.brand,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    ...typography.h3,
    color: colors.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    marginVertical: spacing.md,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  dependentName: {
    ...typography.h3,
    color: colors.ink,
    marginTop: 6,
  },
  relationshipPill: {
    backgroundColor: colors.brandSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  relationshipText: {
    ...typography.caption,
    color: colors.brandInk,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.bgMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: spacing.md,
  },
  infoLabel: {
    ...typography.small,
    fontWeight: '600',
    color: colors.ink3,
    flexShrink: 0,
  },
  infoValue: {
    ...typography.small,
    color: colors.ink,
    textAlign: 'right',
    flex: 1,
  },
  primaryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.brand,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
});
