import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, Pressable, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { BottomBar } from '../components/BottomBar';
import { Dependent, VaccineApplication } from './types/vaccination';

const DEPENDENTS: Dependent[] = [
  {
    id: 'dep-1',
    userId: 'user-1',
    name: 'João Pedro',
    birthDate: '2019-03-12',
    sex: 'M',
  },
  {
    id: 'dep-2',
    userId: 'user-1',
    name: 'Ana Clara',
    birthDate: '2022-08-01',
    sex: 'F',
  },
];

const APPLICATIONS: VaccineApplication[] = [
  {
    id: 'app-1',
    dependentId: 'dep-1',
    vaccineId: 'vac-dtp',
    vaccineName: 'DTP - 1º reforço',
    applicationDate: '2025-02-10',
    dueDate: '2026-03-02',
    status: 'pending',
  },
  {
    id: 'app-2',
    dependentId: 'dep-1',
    vaccineId: 'vac-influenza',
    vaccineName: 'Influenza anual',
    applicationDate: '2025-05-22',
    dueDate: '2026-02-27',
    status: 'pending',
  },
  {
    id: 'app-3',
    dependentId: 'dep-1',
    vaccineId: 'vac-triplice-viral',
    vaccineName: 'Tríplice viral',
    applicationDate: '2024-03-15',
    status: 'applied',
  },
  {
    id: 'app-4',
    dependentId: 'dep-2',
    vaccineId: 'vac-polio',
    vaccineName: 'Poliomielite - reforço',
    dueDate: '2026-04-03',
    status: 'pending',
  },
  {
    id: 'app-5',
    dependentId: 'dep-2',
    vaccineId: 'vac-hepatite-b',
    vaccineName: 'Hepatite B',
    applicationDate: '2024-11-09',
    status: 'applied',
  },
];

const ALERTS: Record<string, string[]> = {
  'dep-1': [
    'Reforço da DTP vence em 8 dias.',
    'Influenza anual prevista para esta semana.',
  ],
  'dep-2': [
    'Poliomielite entra em atraso em 12 dias.',
  ],
};

export default function Index() {
  const router = useRouter();
  const [selectedDependentId, setSelectedDependentId] = useState<string>(DEPENDENTS[0].id);

  const selectedDependent = useMemo(
    () => DEPENDENTS.find((dependent) => dependent.id === selectedDependentId) ?? DEPENDENTS[0],
    [selectedDependentId]
  );

  const selectedApplications = useMemo(
    () => APPLICATIONS.filter((item) => item.dependentId === selectedDependent.id),
    [selectedDependent.id]
  );

  const pendingVaccines = selectedApplications.filter((item) => item.status === 'pending');
  const appliedVaccines = selectedApplications.filter((item) => item.status === 'applied');
  const nextVaccine = pendingVaccines.find((item) => item.dueDate);
  const activeAlerts = ALERTS[selectedDependent.id] ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View>
          <Text style={styles.title}>Carteira Digital</Text>
          <Text style={styles.subtitle}>Resumo vacinal familiar</Text>
        </View>
        <Ionicons
          name="notifications-outline"
          size={24}
          color="#000000ff"
          style={styles.notificationsIcon}
        />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Dependentes</Text>
        <FlatList
          horizontal
          data={DEPENDENTS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dependentList}
          renderItem={({ item }) => {
            const isSelected = selectedDependentId === item.id;
            return (
              <Pressable
                style={[styles.dependentChip, isSelected && styles.dependentChipActive]}
                onPress={() => setSelectedDependentId(item.id)}
              >
                <Text style={[styles.dependentChipText, isSelected && styles.dependentChipTextActive]}>
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
        />

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Aplicadas</Text>
            <Text style={styles.summaryValue}>{appliedVaccines.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Pendentes</Text>
            <Text style={styles.summaryValue}>{pendingVaccines.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Próxima dose</Text>
            <Text style={styles.summaryText}>{nextVaccine?.vaccineName ?? 'Sem pendências'}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Alertas</Text>
            <Text style={styles.summaryValue}>{activeAlerts.length}</Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Vacinas pendentes</Text>
          {pendingVaccines.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma vacina pendente para este dependente.</Text>
          ) : (
            pendingVaccines.map((item) => (
              <Pressable
                key={item.id}
                style={styles.listItem}
                onPress={() =>
                  router.push({
                    pathname: '/location-details',
                    params: { dependent: JSON.stringify(selectedDependent) },
                  })
                }
              >
                <View>
                  <Text style={styles.listItemTitle}>{item.vaccineName}</Text>
                  <Text style={styles.listItemSubtitle}>Prevista: {item.dueDate ?? 'a definir'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#29442dff" />
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Alertas ativos</Text>
          {activeAlerts.length === 0 ? (
            <Text style={styles.emptyText}>Sem alertas no momento.</Text>
          ) : (
            activeAlerts.map((alertMessage, index) => (
              <View key={`${selectedDependent.id}-${index}`} style={styles.alertItem}>
                <Ionicons name="alert-circle-outline" size={18} color="#29442dff" />
                <Text style={styles.alertText}>{alertMessage}</Text>
              </View>
            ))
          )}
        </View>
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
  topContainer: {
    backgroundColor: '#ACDAD8',
    paddingHorizontal: 16,
    paddingTop: '13%',
    paddingBottom: 14,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f3322',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#35573c',
  },
  notificationsIcon: {
    backgroundColor: '#CAE3E2',
    borderRadius: 16,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 130,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f3322',
    marginBottom: 8,
  },
  dependentList: {
    paddingBottom: 4,
    gap: 8,
  },
  dependentChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#B8DCD9',
    borderRadius: 20,
  },
  dependentChipActive: {
    backgroundColor: '#29442dff',
  },
  dependentChipText: {
    fontSize: 13,
    color: '#1f3322',
    fontWeight: '500',
  },
  dependentChipTextActive: {
    color: '#fff',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  summaryCard: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#5b6b60',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f3322',
  },
  summaryText: {
    fontSize: 13,
    color: '#1f3322',
    fontWeight: '600',
  },
  sectionBlock: {
    marginTop: 14,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f3322',
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#66776b',
    marginTop: 2,
  },
  alertItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#1f3322',
  },
  emptyText: {
    fontSize: 13,
    color: '#66776b',
  },
});
