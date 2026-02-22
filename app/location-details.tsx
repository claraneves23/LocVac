import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomBar } from '../components/BottomBar';
import { Dependent, VaccineApplication } from './types/vaccination';
import { useMemo, useState } from 'react';

type Tab = 'historico' | 'pendentes' | 'alertas';

const DEFAULT_DEPENDENT: Dependent = {
  id: 'dep-1',
  userId: 'user-1',
  name: 'João Pedro',
  birthDate: '2019-03-12',
  sex: 'M',
};

const APPLICATIONS: VaccineApplication[] = [
  {
    id: 'app-1',
    dependentId: 'dep-1',
    vaccineId: 'vac-dtp',
    vaccineName: 'DTP - 1º reforço',
    dueDate: '2026-03-02',
    status: 'pending',
    notes: 'Agendar em unidade de referência.',
  },
  {
    id: 'app-2',
    dependentId: 'dep-1',
    vaccineId: 'vac-influenza',
    vaccineName: 'Influenza anual',
    dueDate: '2026-02-27',
    status: 'pending',
  },
  {
    id: 'app-3',
    dependentId: 'dep-1',
    vaccineId: 'vac-triplice-viral',
    vaccineName: 'Tríplice viral',
    applicationDate: '2024-03-15',
    lot: 'A37BC9',
    healthUnit: 'UBS Centro',
    status: 'applied',
  },
  {
    id: 'app-4',
    dependentId: 'dep-1',
    vaccineId: 'vac-hepatite-b',
    vaccineName: 'Hepatite B',
    applicationDate: '2023-09-22',
    lot: 'HB2109',
    healthUnit: 'Policlínica Municipal',
    status: 'applied',
  },
];

const ALERTS = [
  'DTP entra em atraso em 8 dias.',
  'Influenza anual disponível para agendamento.',
];

export default function LocationDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ dependent?: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('historico');

  const dependent = useMemo<Dependent>(() => {
    if (!params.dependent || typeof params.dependent !== 'string') {
      return DEFAULT_DEPENDENT;
    }

    try {
      return JSON.parse(params.dependent) as Dependent;
    } catch {
      return DEFAULT_DEPENDENT;
    }
  }, [params.dependent]);

  const dependentApplications = APPLICATIONS.filter(
    (item) => item.dependentId === dependent.id
  );
  const appliedItems = dependentApplications.filter((item) => item.status === 'applied');
  const pendingItems = dependentApplications.filter((item) => item.status === 'pending' || item.status === 'overdue');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{dependent.name.charAt(0)}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.title}>{dependent.name}</Text>
          <Text style={styles.subtitle}>Nascimento: {dependent.birthDate}</Text>
          <Text style={styles.subtitle}>Resumo da carteira digital</Text>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={18} color="#29442dff" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Aplicadas</Text>
          <Text style={styles.summaryValue}>{appliedItems.length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pendentes</Text>
          <Text style={styles.summaryValue}>{pendingItems.length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Alertas</Text>
          <Text style={styles.summaryValue}>{ALERTS.length}</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'historico' && styles.tabActive]} onPress={() => setActiveTab('historico')}>
          <Text style={[styles.tabText, activeTab === 'historico' && styles.tabTextActive]}>Histórico</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'pendentes' && styles.tabActive]} onPress={() => setActiveTab('pendentes')}>
          <Text style={[styles.tabText, activeTab === 'pendentes' && styles.tabTextActive]}>Pendentes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'alertas' && styles.tabActive]} onPress={() => setActiveTab('alertas')}>
          <Text style={[styles.tabText, activeTab === 'alertas' && styles.tabTextActive]}>Alertas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollableContent} contentContainerStyle={styles.tabContentContainer}>
        {activeTab === 'historico' && (
          <View>
            {appliedItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{item.vaccineName}</Text>
                <Text style={styles.itemText}>Aplicada em: {item.applicationDate ?? 'sem data'}</Text>
                <Text style={styles.itemText}>Lote: {item.lot ?? 'não informado'}</Text>
                <Text style={styles.itemText}>Unidade: {item.healthUnit ?? 'não informado'}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'pendentes' && (
          <View>
            {pendingItems.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma vacina pendente.</Text>
            ) : (
              pendingItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{item.vaccineName}</Text>
                  <Text style={styles.itemText}>Prevista para: {item.dueDate ?? 'a definir'}</Text>
                  <Text style={styles.itemText}>{item.notes ?? 'Sem observações.'}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'alertas' && (
          <View>
            {ALERTS.map((alertMessage, index) => (
              <View key={`${dependent.id}-alert-${index}`} style={styles.alertItem}>
                <Ionicons name="alert-circle-outline" size={18} color="#29442dff" />
                <Text style={styles.alertText}>{alertMessage}</Text>
              </View>
            ))}
          </View>
        )}
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
    marginTop: '12%',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#B0D5D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#29442dff',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f3322',
  },
  subtitle: {
    fontSize: 12,
    color: '#607367',
  },
  closeButton: {
    backgroundColor: '#B0D5D3',
    borderRadius: 20,
    padding: 8,
  },
  summaryRow: {
    marginTop: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#607367',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f3322',
  },
  tabsContainer: {
    marginTop: 12,
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#29442dff',
  },
  tabText: {
    fontSize: 13,
    color: '#5f6e64',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#29442dff',
    fontWeight: '700',
  },
  scrollableContent: {
    flex: 1,
  },
  tabContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f3322',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 12,
    color: '#5f6e64',
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 13,
    color: '#607367',
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
});
