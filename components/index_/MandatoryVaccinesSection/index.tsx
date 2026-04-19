import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MandatoryVaccineRecord } from '../../../app/types/vaccination';
import { VacinaDTO } from '../../../app/service/mandatoryVaccineService';

const formatDateToBR = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

type MandatoryVaccinesSectionProps = {
  vaccines: VacinaDTO[];
  records: MandatoryVaccineRecord[];
  onOpenModal: (vaccineId: string) => void;
};

export default function MandatoryVaccinesSection({ vaccines, records, onOpenModal }: MandatoryVaccinesSectionProps) {
  if (vaccines.length === 0) return null;

  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionTitle}>VACINAS DO 1° ANO DE VIDA</Text>
      <View style={styles.mandatoryVaccinesContainer}>
        {(() => {
          let lastAvailableIdx = -1;
          for (let i = 0; i < vaccines.length; i++) {
            const rec = records.find((r) => r.vaccineId === String(vaccines[i].id));
            if (!rec?.isApplied) {
              lastAvailableIdx = i;
              break;
            }
          }

          let canShow = true;
          return vaccines.map((vaccine, idx) => {
            const record = records.find((r) => r.vaccineId === String(vaccine.id));

            if (!canShow && !record?.isApplied) return null;

            const isLastAvailable = idx === lastAvailableIdx;

            const element = (
              <Pressable
                key={vaccine.id}
                style={styles.mandatoryVaccineItem}
                onPress={() => isLastAvailable ? onOpenModal(String(vaccine.id)) : undefined}
                disabled={!isLastAvailable}
              >
                <View style={styles.mandatoryVaccineHeader}>
                  <View style={styles.mandatoryVaccineInfo}>
                    <View style={styles.mandatoryVaccineTexts}>
                      <Text style={styles.mandatoryVaccineName}>{vaccine.nome}</Text>
                      <Text style={styles.mandatoryVaccineDesc}>{vaccine.descricao}</Text>
                    </View>
                  </View>
                  <View style={styles.mandatoryVaccineStatus}>
                    {record?.isApplied ? (
                      <Ionicons name="checkmark-circle" size={24} color="#09BEA5" />
                    ) : (
                      <Ionicons name="ellipse-outline" size={24} color="#9CA3AF" />
                    )}
                  </View>
                </View>

                {record?.isApplied && (
                  <View style={styles.mandatoryVaccineDetails}>
                    {record.applicationDate && (
                      <Text style={styles.mandatoryVaccineDetail}>
                        <Text style={styles.mandatoryVaccineDetailLabel}>Data: </Text>
                        {formatDateToBR(record.applicationDate)}
                      </Text>
                    )}
                    {record.lot && (
                      <Text style={styles.mandatoryVaccineDetail}>
                        <Text style={styles.mandatoryVaccineDetailLabel}>Lote: </Text>
                        {record.lot}
                      </Text>
                    )}
                    {record.professionalName && (
                      <Text style={styles.mandatoryVaccineDetail}>
                        <Text style={styles.mandatoryVaccineDetailLabel}>Profissional: </Text>
                        {record.professionalName}
                      </Text>
                    )}
                  </View>
                )}
              </Pressable>
            );

            if (!record?.isApplied) canShow = false;
            return element;
          });
        })()}
      </View>
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
  mandatoryVaccineStatus: {
    marginLeft: 8,
  },
  mandatoryVaccineDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8EEE8',
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
