import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { FamilyMember } from '../../../src/types/vaccination';
import { type Colors, radii, spacing, typography, shadows } from '../../../src/theme/tokens';
import { useTheme } from '../../../src/context/ThemeContext';
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

type InfoRowProps = { label: string; value?: string; styles: ReturnType<typeof makeStyles> };
function InfoRow({ label, value, styles }: InfoRowProps) {
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
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
              <InfoRow label="Nascimento" value={formatDateToBR(dependent.birthDate)} styles={styles} />
              <InfoRow label="Sexo" value={formatSex(dependent.sex)} styles={styles} />
              <InfoRow label="Local de nascimento" value={dependent.birthPlace} styles={styles} />
              <InfoRow label="Responsável" value={dependent.guardianName} styles={styles} />
              <InfoRow label="CNS" value={dependent.cns} styles={styles} />
              <InfoRow label="Telefone" value={dependent.phone} styles={styles} />
              <InfoRow label="CEP" value={dependent.zipCode} styles={styles} />
              <InfoRow label="Rua" value={dependent.address} styles={styles} />
              <InfoRow label="Complemento" value={dependent.complement} styles={styles} />
              <InfoRow label="Município" value={dependent.city} styles={styles} />
              <InfoRow label="Estado" value={dependent.state} styles={styles} />
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

const makeStyles = (c: Colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: c.dimDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    backgroundColor: c.bgElev,
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
    color: c.brand,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    ...typography.h3,
    color: c.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.bgMuted,
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
    color: c.ink,
    marginTop: 6,
  },
  relationshipPill: {
    backgroundColor: c.brandSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  relationshipText: {
    ...typography.caption,
    color: c.brandInk,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: c.bgMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
    gap: spacing.md,
  },
  infoLabel: {
    ...typography.small,
    fontWeight: '600',
    color: c.ink3,
    flexShrink: 0,
  },
  infoValue: {
    ...typography.small,
    color: c.ink,
    textAlign: 'right',
    flex: 1,
  },
  primaryButton: {
    marginTop: spacing.md,
    backgroundColor: c.brand,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: c.white,
  },
});
