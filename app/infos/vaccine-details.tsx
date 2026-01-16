import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomBar } from '../../components/BottomBar';

export default function VaccineDetails() {
  const { vaccineId, vaccineName } = useLocalSearchParams();
  const router = useRouter();

  // Dados das vacinas
  const vaccineData: Record<string, any> = {
    '1': {
      name: 'BCG',
      age: 'Ao nascer',
      description: 'Vacina contra tuberculose',
      details: [
        'Protege contra a tuberculose, especialmente as formas graves.',
        'É uma vacina de vírus vivo atenuado.',
        'Deixa uma pequena cicatriz no braço (sinal de que funcionou).',
        'Oferece proteção por aproximadamente 15 anos.',
        'Recomendações: É administrada em uma única dose, preferencialmente nas primeiras 12 horas de vida.',
      ],
      sideEffects: 'Pequeno inchaço no local da injeção, que desaparece naturalmente.',
    },
    '2': {
      name: 'Hepatite B',
      age: 'Ao nascer',
      description: 'Vacina contra hepatite B',
      details: [
        'Protege contra a hepatite B, uma infecção viral do fígado.',
        'Previne cirrose hepática e câncer de fígado.',
        'É uma das vacinas mais seguras disponíveis.',
        'Requer 3 doses para proteção completa.',
        'Oferece proteção por toda a vida com revacinação apropriada.',
      ],
      sideEffects: 'Leve inchaço ou vermelhidão no local da injeção, febre baixa.',
    },
    '3': {
      name: 'Poliomielite',
      age: '2 meses',
      description: 'Vacina contra poliomielite',
      details: [
        'Protege contra a poliomielite, doença que pode causar paralisia.',
        'O Brasil está livre da polio desde 1989.',
        'A vacinação contínua é importante para manter o país protegido.',
        'Requer múltiplas doses durante a infância.',
        'Reforço recomendado na adolescência.',
      ],
      sideEffects: 'Geralmente bem tolerada, pode causar febre leve.',
    },
    '4': {
      name: 'Tríplice (DPT)',
      age: '2 meses',
      description: 'Vacina contra Difteria, Pertussis e Tétano',
      details: [
        'Protege contra três doenças: Difteria, Coqueluche e Tétano.',
        'A difteria pode causar problemas respiratórios graves.',
        'A coqueluche é especialmente perigosa em bebês pequenos.',
        'O tétano é prevenido principalmente pela vacinação.',
        'Reforços são necessários ao longo da vida.',
      ],
      sideEffects: 'Febre, inchaço ou vermelhidão no local, irritabilidade em bebês.',
    },
    '5': {
      name: 'Febre Amarela',
      age: '9 meses',
      description: 'Vacina contra febre amarela',
      details: [
        'Protege contra a febre amarela, transmitida por mosquitos.',
        'Essencial para quem viaja para áreas endêmicas.',
        'Oferece imunidade para a vida toda com uma única dose.',
        'Pode ser necessária para entrada em alguns países.',
        'Não deve ser administrada durante a gravidez.',
      ],
      sideEffects: 'Geralmente bem tolerada, pode causar febre leve ou dor de cabeça 1-2 semanas após.',
    },
    '6': {
      name: 'Meningocócica',
      age: '3 meses',
      description: 'Vacina contra meningite meningocócica',
      details: [
        'Protege contra meningite bacteriana grave.',
        'A meningite meningocócica pode ser fatal.',
        'Existe mais de um sorotipo, razão pela qual múltiplas vacinas são usadas.',
        'Reforços são recomendados em certos intervalos.',
        'Importante para bebês, adolescentes e adultos jovens.',
      ],
      sideEffects: 'Inchaço ou vermelhidão no local, febre baixa em alguns casos.',
    },
    '7': {
      name: 'Pneumocócica',
      age: '2 meses',
      description: 'Vacina contra pneumococo',
      details: [
        'Protege contra infecções causadas pelo pneumococo.',
        'Previne pneumonia, meningite e otite média.',
        'Especialmente importante para bebês e idosos.',
        'Existem várias formulações com cobertura diferente.',
        'Pode ser administrada junto com outras vacinas.',
      ],
      sideEffects: 'Dor ou inchaço no local da injeção, febre baixa.',
    },
    '8': {
      name: 'Rotavírus',
      age: '2 meses',
      description: 'Vacina contra rotavírus',
      details: [
        'Protege contra gastroenterite causada pelo rotavírus.',
        'O rotavírus é a principal causa de diareia grave em bebês.',
        'A vacina é oral (tomada pela boca).',
        'Deve ser administrada antes dos 6 meses de idade.',
        'Oferece proteção por vários anos.',
      ],
      sideEffects: 'Diarreia temporária é a reação mais comum, rara irritabilidade.',
    },
  };

  const vaccine = vaccineData[vaccineId as string];

  if (!vaccine) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Vacina não encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#29442dff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{vaccine.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informação Principal */}
        <View style={styles.mainInfo}>
          <Ionicons name="shield-checkmark-outline" size={64} color="#29442dff" />
          <Text style={styles.vaccineTitle}>{vaccine.name}</Text>
          <Text style={styles.vaccineSubtitle}>{vaccine.description}</Text>
          <View style={styles.ageTag}>
            <Ionicons name="calendar-outline" size={16} color="#29442dff" />
            <Text style={styles.ageText}>{vaccine.age}</Text>
          </View>
        </View>

        {/* Detalhes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          {vaccine.details.map((detail: string, index: number) => (
            <View key={index} style={styles.detailItem}>
              <View style={styles.bullet} />
              <Text style={styles.detailText}>{detail}</Text>
            </View>
          ))}
        </View>

        {/* Efeitos Colaterais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Possíveis Reações</Text>
          <View style={styles.sideEffectsBox}>
            <Ionicons name="alert-circle-outline" size={20} color="#FF9800" />
            <Text style={styles.sideEffectsText}>{vaccine.sideEffects}</Text>
          </View>
        </View>

        {/* Recomendação */}
        <View style={styles.recommendationBox}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
          <Text style={styles.recommendationText}>
            Sempre consulte um profissional de saúde para dúvidas sobre vacinação e seu cronograma específico.
          </Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <BottomBar />
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
    paddingTop: 6,
  },
  notFoundText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  mainInfo: {
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
  vaccineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#29442dff',
    marginTop: 12,
  },
  vaccineSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  ageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  ageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#29442dff',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#29442dff',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#29442dff',
    marginRight: 12,
    marginTop: 6,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  sideEffectsBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  sideEffectsText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  recommendationBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    marginBottom: '11%',
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 18,
  },
});
