import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function VaccinesInfo() {
  const router = useRouter();

  const vaccines = [
    {
      id: '1',
      name: 'BCG',
      description: 'Tuberculose',
      benefit: 'Protege contra tuberculose, doença infecciosa grave que afeta principalmente os pulmões.',
    },
    {
      id: '2',
      name: 'Hepatite B',
      description: 'Infecção do fígado',
      benefit: 'Evita cirrose e câncer de fígado, doenças potencialmente fatais.',
    },
    {
      id: '3',
      name: 'Poliomielite',
      description: 'Paralisia infantil',
      benefit: 'Previne paralisia permanente, doença praticamente erradicada no Brasil.',
    },
    {
      id: '4',
      name: 'Tríplice (DPT)',
      description: 'Difteria, Coqueluche e Tétano',
      benefit: 'Protege contra três doenças graves que podem ser fatais sem tratamento.',
    },
    {
      id: '5',
      name: 'Febre Amarela',
      description: 'Doença viral transmitida por mosquitos',
      benefit: 'Essencial para quem viaja para regiões endêmicas da doença.',
    },
    {
      id: '6',
      name: 'Meningocócica',
      description: 'Meningite bacteriana',
      benefit: 'Previne meningite, doença que pode ser fatal e deixar sequelas graves.',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#29442dff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vacinas Importantes</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introBox}>
          <Ionicons name="shield-outline" size={48} color="#29442dff" />
          <Text style={styles.introTitle}>Imunização é Proteção</Text>
          <Text style={styles.introText}>
            As vacinas são uma das maiores conquistas da medicina moderna, salvando milhões de vidas a cada ano. Conheça as principais vacinas que protegem a saúde.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Principais Vacinas</Text>

        {vaccines.map((vaccine) => (
          <TouchableOpacity
            key={vaccine.id}
            style={styles.vaccineCard}
            onPress={() => router.push({
              pathname: '/infos/vaccine-details',
              params: { vaccineId: vaccine.id, vaccineName: vaccine.name },
            })}
            activeOpacity={0.7}
          >
            <View style={styles.vaccineHeader}>
              <View style={styles.vaccineIconBox}>
                <Ionicons name="shield-checkmark-outline" size={28} color="#29442dff" />
              </View>
              <View style={styles.vaccineInfo}>
                <Text style={styles.vaccineName}>{vaccine.name}</Text>
                <Text style={styles.vaccineDesc}>{vaccine.description}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color="#ACDAD8" />
            </View>
            <View style={styles.benefitBox}>
              <Text style={styles.benefitLabel}>Benefício:</Text>
              <Text style={styles.benefitText}>{vaccine.benefit}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color="#1976D2" />
          <Text style={styles.infoText}>
            Todas as vacinas disponibilizadas pelo SUS são seguras e passaram por rigorosos testes antes de serem aprovadas.
          </Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAE3E2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: '10%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#29442dff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  introBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 24,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#29442dff',
    marginTop: 12,
  },
  introText: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 16,
    marginTop: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#29442dff',
    marginTop: 16,
    marginBottom: 12,
  },
  vaccineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vaccineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  vaccineIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#29442dff',
  },
  vaccineDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  benefitBox: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  benefitLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#29442dff',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    marginVertical: '10%',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 16,
  },
});
