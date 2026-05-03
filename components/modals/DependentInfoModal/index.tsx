import { View, Text, Pressable, Modal, ScrollView, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FamilyMember } from '../../../app/types/vaccination';

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
      <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.5)" translucent />
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Dados do Dependente</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={18} color="#29442dff" />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarSection}>
              {dependent.photoUri ? (
                <Image source={{ uri: dependent.photoUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {dependent.name ? dependent.name.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <Text style={styles.dependentName}>{dependent.name}</Text>
              {dependent.relationship && (
                <Text style={styles.dependentRelationship}>{dependent.relationship}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <InfoRow label="Data de Nascimento" value={formatDateToBR(dependent.birthDate)} />
            <InfoRow label="Sexo" value={formatSex(dependent.sex)} />
            <InfoRow label="Local de Nascimento" value={dependent.birthPlace} />
            <InfoRow label="Responsável" value={dependent.guardianName} />
            <InfoRow label="Telefone" value={dependent.phone} />
            <InfoRow label="CEP" value={dependent.zipCode} />
            <InfoRow label="Rua" value={dependent.address} />
            <InfoRow label="Complemento" value={dependent.complement} />
            <InfoRow label="Município" value={dependent.city} />
            <InfoRow label="Estado" value={dependent.state} />
          </ScrollView>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f3322',
  },
  scroll: {
    maxHeight: '100%',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#B0D5D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '700',
    color: '#29442dff',
  },
  dependentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f3322',
  },
  dependentRelationship: {
    marginTop: 2,
    fontSize: 13,
    color: '#607367',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EEE8',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F7F6',
    gap: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#607367',
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 13,
    color: '#1f3322',
    textAlign: 'right',
    flex: 1,
  },
  closeButton: {
    marginTop: 14,
    backgroundColor: '#29442dff',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
