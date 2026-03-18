import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { FamilyMember } from '../../app/types/vaccination';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const formatDateToBR = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

type VaccinationCardProps = {
  profile: FamilyMember;
  onOpenImagePreview: (uri?: string) => void;
};

export default function VaccinationCard({ profile, onOpenImagePreview }: VaccinationCardProps) {
  return (
    <View style={styles.vaccinationCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <MaterialIcons name="vaccines" size={24} color="#005570" />
          <View>
            <Text style={styles.cardTitle}>Carteira de Vacinação</Text>
            <Text style={styles.cardSubtitle}>Digital</Text>
          </View>
        </View>
        {profile.photoUri ? (
          <Pressable
            style={styles.cardProfileBadge}
            onPress={() => onOpenImagePreview(profile.photoUri)}
          >
            <Image source={{ uri: profile.photoUri }} style={styles.cardProfileImage} />
          </Pressable>
        ) : (
          <View style={styles.cardProfileBadge}>
            <Text style={styles.cardProfileText}>{profile.name.charAt(0)}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardBody}>
        <View style={styles.cardInfoRow}>
          <Text style={styles.cardInfoLabel}>
            {profile.kind === 'dependent' ? 'Nome da Criança' : 'Nome'}
          </Text>
          <Text style={styles.cardInfoValue}>{profile.name}</Text>
        </View>

        {profile.kind === 'dependent' && profile.guardianName && (
          <View style={styles.cardInfoRow}>
            <Text style={styles.cardInfoLabel}>Nome da Mãe ou Responsável</Text>
            <Text style={styles.cardInfoValue}>{profile.guardianName}</Text>
          </View>
        )}

        {profile.birthPlace && (
          <View style={styles.cardInfoRow}>
            <Text style={styles.cardInfoLabel}>Local de Nascimento</Text>
            <Text style={styles.cardInfoValue}>{profile.birthPlace}</Text>
          </View>
        )}

        <View style={styles.cardInfoRow}>
          <Text style={styles.cardInfoLabel}>Data de Nascimento</Text>
          <Text style={styles.cardInfoValue}>{formatDateToBR(profile.birthDate)}</Text>
        </View>

        {profile.address && (
          <View style={styles.cardInfoRow}>
            <Text style={styles.cardInfoLabel}>Endereço</Text>
            <Text style={styles.cardInfoValue}>{profile.address}</Text>
          </View>
        )}

        {(profile.city || profile.state) && (
          <View style={styles.cardInfoRow}>
            <Text style={styles.cardInfoLabel}>Município/Estado</Text>
            <Text style={styles.cardInfoValue}>
              {profile.city && profile.state
                ? `${profile.city} - ${profile.state}`
                : profile.city || profile.state}
            </Text>
          </View>
        )}

        {profile.zipCode && (
          <View style={styles.cardInfoRow}>
            <Text style={styles.cardInfoLabel}>CEP</Text>
            <Text style={styles.cardInfoValue}>{profile.zipCode}</Text>
          </View>
        )}

        {profile.phone && (
          <View style={styles.cardInfoRow}>
            <Text style={styles.cardInfoLabel}>Telefone</Text>
            <Text style={styles.cardInfoValue}>{profile.phone}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  vaccinationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f3322',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#66776b',
    fontWeight: '500',
  },
  cardProfileBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CAE3E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#09BEA5',
  },
  cardProfileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  cardProfileText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f3322',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E8EEE8',
    marginVertical: 12,
  },
  cardBody: {
    gap: 10,
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfoLabel: {
    fontSize: 13,
    color: '#66776b',
    fontWeight: '500',
  },
  cardInfoValue: {
    fontSize: 14,
    color: '#1f3322',
    fontWeight: '600',
  },
});