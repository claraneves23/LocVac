import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Schedule() {
  const router = useRouter();

  const scheduleData = [
    {
      age: 'Ao nascer',
      vaccines: ['BCG', 'Hepatite B (1ª dose)'],
    },
    {
      age: '2 meses',
      vaccines: ['Hepatite B (2ª dose)', 'Poliomielite (1ª dose)', 'Tríplice (DPT) (1ª dose)', 'Pneumocócica (1ª dose)', 'Rotavírus'],
    },
    {
      age: '4 meses',
      vaccines: ['Poliomielite (2ª dose)', 'Tríplice (DPT) (2ª dose)', 'Pneumocócica (2ª dose)', 'Rotavírus'],
    },
    {
      age: '6 meses',
      vaccines: ['Hepatite B (3ª dose)', 'Poliomielite (3ª dose)', 'Tríplice (DPT) (3ª dose)', 'Pneumocócica (3ª dose)'],
    },
    {
      age: '9 meses',
      vaccines: ['Febre Amarela'],
    },
    {
      age: '12 meses',
      vaccines: ['Tríplice Viral (Sarampo, Caxumba, Rubéola)', 'Meningocócica C'],
    },
    {
      age: '15 meses',
      vaccines: ['Poliomielite (Reforço)', 'Tríplice (DPT) (Reforço)'],
    },
    {
      age: '4-6 anos',
      vaccines: ['Tríplice Viral (Reforço)', 'Tríplice (DPT) (Reforço)', 'Poliomielite (Reforço)'],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#29442dff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cronograma de Vacinação</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introBox}>
          <Ionicons name="calendar-outline" size={48} color="#29442dff" />
          <Text style={styles.introTitle}>Calendário Vacinal</Text>
          <Text style={styles.introText}>
            Siga este cronograma recomendado para proteger sua criança desde o nascimento.
          </Text>
        </View>

        {scheduleData.map((item, index) => (
          <View key={index} style={styles.scheduleItem}>
            <View style={styles.ageBox}>
              <Ionicons name="calendar" size={20} color="#fff" />
              <Text style={styles.ageText}>{item.age}</Text>
            </View>
            <View style={styles.vaccinesList}>
              {item.vaccines.map((vaccine, vaccineIndex) => (
                <View key={vaccineIndex} style={styles.vaccineRow}>
                  <View style={styles.checkMark}>
                    <Text style={styles.checkMarkText}>✓</Text>
                  </View>
                  <Text style={styles.vaccineText}>{vaccine}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.importantBox}>
          <Ionicons name="warning-outline" size={24} color="#FF6F00" />
          <View style={styles.importantContent}>
            <Text style={styles.importantTitle}>Importante</Text>
            <Text style={styles.importantText}>
              Este calendário é uma referência. Consulte seu pediatra ou unidade de saúde para um cronograma personalizado baseado na saúde individual da criança.
            </Text>
          </View>
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
    fontSize: 18,
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
  scheduleItem: {
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#29442dff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  ageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  vaccinesList: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  vaccineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkMarkText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  vaccineText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  importantBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    marginVertical: '10%',
  },
  importantContent: {
    flex: 1,
  },
  importantTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6F00',
    marginBottom: 4,
  },
  importantText: {
    fontSize: 12,
    color: '#E65100',
    lineHeight: 16,
  },
});
