import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ALERTS_BY_PROFILE, APPLICATIONS, MAIN_USER } from './data/family';
import { Dependent, FamilyMember } from './types/vaccination';
import { getDependents } from '../src/storage/dependents';

type Tab = 'historico' | 'pendentes' | 'alertas';

export default function LocationDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ profile?: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('historico');
  const [dependents, setDependents] = useState<Dependent[]>([]);

  useFocusEffect(
    useCallback(() => {
      getDependents().then(setDependents);
    }, [])
  );

  const familyMembers = useMemo<FamilyMember[]>(
    () => [
      {
        id: MAIN_USER.id,
        userId: MAIN_USER.id,
        name: MAIN_USER.name,
        birthDate: MAIN_USER.birthDate,
        sex: MAIN_USER.sex,
        kind: 'user',
      },
      ...dependents.map((dependent) => ({
        id: dependent.id,
        userId: dependent.userId,
        name: dependent.name,
        birthDate: dependent.birthDate,
        sex: dependent.sex,
        kind: 'dependent' as const,
        relationship: dependent.relationship,
      })),
    ],
    [dependents]
  );

  const profile = useMemo<FamilyMember>(() => {
    const fallback: FamilyMember = {
      id: MAIN_USER.id,
      userId: MAIN_USER.id,
      name: MAIN_USER.name,
      birthDate: MAIN_USER.birthDate,
      sex: MAIN_USER.sex,
      kind: 'user',
    };

    if (!params.profile || typeof params.profile !== 'string') {
      return fallback;
    }

    try {
      return JSON.parse(params.profile) as FamilyMember;
    } catch {
      return fallback;
    }
  }, [params.profile]);

  const currentProfile = useMemo(() => {
    const match = familyMembers.find((member) => member.id === profile.id);
    return match ?? profile;
  }, [familyMembers, profile]);

  const profileApplications = APPLICATIONS.filter(
    (item) => item.profileId === currentProfile.id
  );
  const appliedItems = profileApplications.filter((item) => item.status === 'applied');
  const pendingItems = profileApplications.filter((item) => item.status === 'pending' || item.status === 'overdue');
  const alerts = ALERTS_BY_PROFILE[currentProfile.id] ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{currentProfile.name.charAt(0)}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.title}>{currentProfile.kind === 'user' ? `${currentProfile.name} (Titular)` : currentProfile.name}</Text>
          <Text style={styles.subtitle}>Nascimento: {currentProfile.birthDate}</Text>
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
          <Text style={styles.summaryValue}>{alerts.length}</Text>
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
            {alerts.map((alertMessage, index) => (
              <View key={`${currentProfile.id}-alert-${index}`} style={styles.alertItem}>
                <Ionicons name="alert-circle-outline" size={18} color="#29442dff" />
                <Text style={styles.alertText}>{alertMessage}</Text>
              </View>
            ))}
          </View>
        )}
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
