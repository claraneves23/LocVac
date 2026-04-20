import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { OtherVaccine } from '../../../app/types/vaccination';

const formatDateToBR = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

type OtherVaccinesSectionProps = {
  vaccines: OtherVaccine[];
  onOpenModal: (vaccine?: OtherVaccine) => void;
  onDelete: (vaccineId: string) => void;
};

export default function OtherVaccinesSection({ vaccines, onOpenModal, onDelete }: OtherVaccinesSectionProps) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>OUTRAS VACINAS</Text>
        <Pressable style={styles.addButton} onPress={() => onOpenModal()}>
          <Ionicons name="add-circle" size={24} color="#09BEA5" />
        </Pressable>
      </View>

      {vaccines.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma vacina adicional registrada.</Text>
      ) : (
        <View style={styles.mandatoryVaccinesContainer}>
          {vaccines.map((vaccine) => (
            <Pressable
              key={vaccine.id}
              style={styles.mandatoryVaccineItem}
              onPress={() => onOpenModal(vaccine)}
            >
              <View style={styles.mandatoryVaccineHeader}>
                <View style={styles.mandatoryVaccineInfo}>
                  <View style={styles.mandatoryVaccineTexts}>
                    <Text style={styles.mandatoryVaccineName}>{vaccine.vaccineName}</Text>
                    {vaccine.applicationDate && (
                      <Text style={styles.mandatoryVaccineDesc}>
                        Aplicada em {formatDateToBR(vaccine.applicationDate)}
                      </Text>
                    )}
                  </View>
                </View>
                <Pressable
                  onPress={() => onDelete(vaccine.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </Pressable>
              </View>

              {vaccine.applicationDate && (
                <View style={styles.mandatoryVaccineDetails}>
                  {vaccine.lot && (
                    <Text style={styles.mandatoryVaccineDetail}>
                      <Text style={styles.mandatoryVaccineDetailLabel}>Lote: </Text>
                      {vaccine.lot}
                    </Text>
                  )}
                  {vaccine.code && (
                    <Text style={styles.mandatoryVaccineDetail}>
                      <Text style={styles.mandatoryVaccineDetailLabel}>Código: </Text>
                      {vaccine.code}
                    </Text>
                  )}
                  {vaccine.professionalName && (
                    <Text style={styles.mandatoryVaccineDetail}>
                      <Text style={styles.mandatoryVaccineDetailLabel}>Profissional: </Text>
                      {vaccine.professionalName}
                      {vaccine.professionalId && ` (${vaccine.professionalId})`}
                    </Text>
                  )}
                </View>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 16,
    paddingTop: 12,
    paddingLeft: 4,
    fontWeight: '900',
    color: '#1f3322',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#66776b',
  },
  mandatoryVaccinesContainer: {
    gap: 6,
  },
  mandatoryVaccineItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
    minHeight: 64,
    justifyContent: 'center',
  },
  mandatoryVaccineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mandatoryVaccineInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  mandatoryVaccineTexts: {
    flex: 1,
  },
  mandatoryVaccineName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f3322',
    marginBottom: 2,
  },
  mandatoryVaccineDesc: {
    fontSize: 12,
    color: '#66776b',
  },
  mandatoryVaccineDetails: {
    marginTop: 8,
    paddingTop: 8,
    gap: 4,
  },
  mandatoryVaccineDetail: {
    fontSize: 12,
    color: '#66776b',
  },
  mandatoryVaccineDetailLabel: {
    fontWeight: '600',
    color: '#1f3322',
  },
});