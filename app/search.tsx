import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ALERTS_BY_PROFILE, MAIN_USER } from './data/family';
import { MANDATORY_FIRST_YEAR_VACCINES } from './data/mandatory-vaccines';
import { Dependent, FamilyMember, VaccineApplication, MandatoryVaccineRecord, OtherVaccine, ParticipatingCampaign } from './types/vaccination';
import { getDependents } from '../src/storage/dependents';
import { getVaccines } from '../src/storage/vaccines';
import { getMandatoryVaccineRecords } from '../src/storage/mandatory-vaccines';
import { getOtherVaccines } from '../src/storage/other-vaccines';
import { getCampaigns } from '../src/storage/campaigns';

const formatDateToBR = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const SELECTED_PROFILE_KEY = 'selectedProfileId';

type ActiveTab = 'history' | 'pending';

interface HistoryEntry {
  id: string;
  type: 'vaccine' | 'mandatory' | 'other' | 'campaign';
  name: string;
  date?: string;
  details?: string;
  profileId: string;
  profileName: string;
}

interface PendingEntry {
  id: string;
  type: 'pending_vaccine' | 'missing_mandatory' | 'alert';
  name: string;
  description?: string;
  dueDate?: string;
  profileId: string;
  profileName: string;
  urgency: 'high' | 'medium' | 'low';
}

export default function Search() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('history');
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [vaccines, setVaccines] = useState<VaccineApplication[]>([]);
  const [mandatoryRecords, setMandatoryRecords] = useState<MandatoryVaccineRecord[]>([]);
  const [otherVaccines, setOtherVaccines] = useState<OtherVaccine[]>([]);
  const [campaigns, setCampaigns] = useState<ParticipatingCampaign[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [filterProfile, setFilterProfile] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const saved = await AsyncStorage.getItem(SELECTED_PROFILE_KEY);
      setSelectedProfileId(saved || MAIN_USER.id);
    };
    loadProfile();
  }, []);

  const loadAll = useCallback(async () => {
    const [deps, vacs, mandatory, other, camps] = await Promise.all([
      getDependents(),
      getVaccines(),
      getMandatoryRecords(),
      getOtherVaccines(),
      getCampaigns(),
    ]);
    setDependents(deps);
    setVaccines(vacs);
    setMandatoryRecords(mandatory);
    setOtherVaccines(other);
    setCampaigns(camps);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const familyMembers = useMemo<FamilyMember[]>(
    () => [
      {
        id: MAIN_USER.id,
        userId: MAIN_USER.id,
        name: MAIN_USER.name,
        birthDate: MAIN_USER.birthDate,
        birthPlace: MAIN_USER.birthPlace,
        sex: MAIN_USER.sex,
        kind: 'user' as const,
      },
      ...dependents.map((d) => ({
        id: d.id,
        userId: d.userId,
        name: d.name,
        birthDate: d.birthDate,
        birthPlace: d.birthPlace,
        sex: d.sex,
        kind: 'dependent' as const,
        photoUri: d.photoUri,
      })),
    ],
    [dependents]
  );

  const getProfileName = useCallback(
    (profileId: string) => {
      if (profileId === MAIN_USER.id) return MAIN_USER.name;
      const dep = dependents.find((d) => d.id === profileId);
      return dep?.name || 'Desconhecido';
    },
    [dependents]
  );

  // ── HISTÓRICO ──
  const historyEntries = useMemo<HistoryEntry[]>(() => {
    const entries: HistoryEntry[] = [];

    vaccines
      .filter((v) => v.status === 'applied')
      .forEach((v) => {
        entries.push({
          id: v.id,
          type: 'vaccine',
          name: v.vaccineName,
          date: v.applicationDate,
          details: [v.lot && `Lote: ${v.lot}`, v.healthUnit && `Local: ${v.healthUnit}`]
            .filter(Boolean)
            .join(' • '),
          profileId: v.profileId,
          profileName: getProfileName(v.profileId),
        });
      });

    mandatoryRecords
      .filter((r) => r.isApplied)
      .forEach((r) => {
        const vaccineInfo = MANDATORY_FIRST_YEAR_VACCINES.find((v) => v.id === r.vaccineId);
        entries.push({
          id: r.id,
          type: 'mandatory',
          name: vaccineInfo?.name || r.vaccineId,
          date: r.applicationDate,
          details: [r.lot && `Lote: ${r.lot}`, r.professionalName && `Prof: ${r.professionalName}`]
            .filter(Boolean)
            .join(' • '),
          profileId: r.profileId,
          profileName: getProfileName(r.profileId),
        });
      });

    otherVaccines.forEach((v) => {
      entries.push({
        id: v.id,
        type: 'other',
        name: v.vaccineName,
        date: v.applicationDate,
        details: [v.lot && `Lote: ${v.lot}`, v.professionalName && `Prof: ${v.professionalName}`]
          .filter(Boolean)
          .join(' • '),
        profileId: v.profileId,
        profileName: getProfileName(v.profileId),
      });
    });

    campaigns.forEach((c) => {
      entries.push({
        id: c.id,
        type: 'campaign',
        name: c.campaignName,
        date: c.participationDate,
        profileId: c.profileId,
        profileName: getProfileName(c.profileId),
      });
    });

    entries.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });

    return entries;
  }, [vaccines, mandatoryRecords, otherVaccines, campaigns, getProfileName]);

  const filteredHistory = useMemo(() => {
    if (!filterProfile) return historyEntries;
    return historyEntries.filter((e) => e.profileId === filterProfile);
  }, [historyEntries, filterProfile]);

  // ── PENDÊNCIAS ──
  const pendingEntries = useMemo<PendingEntry[]>(() => {
    const entries: PendingEntry[] = [];

    // Vacinas pendentes/atrasadas
    vaccines
      .filter((v) => v.status === 'pending' || v.status === 'overdue')
      .forEach((v) => {
        const isOverdue = v.status === 'overdue' || (v.dueDate && v.dueDate < new Date().toISOString().split('T')[0]);
        entries.push({
          id: v.id,
          type: 'pending_vaccine',
          name: v.vaccineName,
          description: isOverdue ? 'Vacina em atraso' : 'Vacina pendente',
          dueDate: v.dueDate,
          profileId: v.profileId,
          profileName: getProfileName(v.profileId),
          urgency: isOverdue ? 'high' : v.dueDate ? 'medium' : 'low',
        });
      });

    // Vacinas obrigatórias do 1º ano não aplicadas
    familyMembers.forEach((member) => {
      const profileRecords = mandatoryRecords.filter((r) => r.profileId === member.id);
      MANDATORY_FIRST_YEAR_VACCINES.forEach((vaccine) => {
        const record = profileRecords.find((r) => r.vaccineId === vaccine.id);
        if (!record || !record.isApplied) {
          entries.push({
            id: `missing-${member.id}-${vaccine.id}`,
            type: 'missing_mandatory',
            name: vaccine.name,
            description: vaccine.description,
            profileId: member.id,
            profileName: getProfileName(member.id),
            urgency: 'medium',
          });
        }
      });
    });

    // Alertas ativos
    Object.entries(ALERTS_BY_PROFILE).forEach(([profileId, alerts]) => {
      alerts.forEach((alertMsg, index) => {
        entries.push({
          id: `alert-${profileId}-${index}`,
          type: 'alert',
          name: alertMsg,
          profileId,
          profileName: getProfileName(profileId),
          urgency: alertMsg.toLowerCase().includes('atraso') || alertMsg.toLowerCase().includes('vence') ? 'high' : 'medium',
        });
      });
    });

    // Ordenar por urgência
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    entries.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    return entries;
  }, [vaccines, mandatoryRecords, familyMembers, getProfileName]);

  const filteredPending = useMemo(() => {
    if (!filterProfile) return pendingEntries;
    return pendingEntries.filter((e) => e.profileId === filterProfile);
  }, [pendingEntries, filterProfile]);

  // ── Helpers de tipo (histórico) ──
  const getTypeLabel = (type: HistoryEntry['type']) => {
    switch (type) {
      case 'vaccine': return 'Vacina';
      case 'mandatory': return 'Obrigatória';
      case 'other': return 'Outra Vacina';
      case 'campaign': return 'Campanha';
    }
  };

  const getTypeColor = (type: HistoryEntry['type']) => {
    switch (type) {
      case 'vaccine': return '#09BEA5';
      case 'mandatory': return '#005570';
      case 'other': return '#6B7280';
      case 'campaign': return '#D97706';
    }
  };

  const getTypeIcon = (type: HistoryEntry['type']): React.ComponentProps<typeof Ionicons>['name'] => {
    switch (type) {
      case 'vaccine': return 'medkit';
      case 'mandatory': return 'shield-checkmark';
      case 'other': return 'medical';
      case 'campaign': return 'megaphone';
    }
  };

  // ── Helpers de tipo (pendências) ──
  const getPendingTypeLabel = (type: PendingEntry['type']) => {
    switch (type) {
      case 'pending_vaccine': return 'Vacina Pendente';
      case 'missing_mandatory': return 'Obrigatória Faltante';
      case 'alert': return 'Alerta';
    }
  };

  const getPendingTypeColor = (type: PendingEntry['type']) => {
    switch (type) {
      case 'pending_vaccine': return '#D97706';
      case 'missing_mandatory': return '#DC2626';
      case 'alert': return '#7C3AED';
    }
  };

  const getPendingTypeIcon = (type: PendingEntry['type']): React.ComponentProps<typeof Ionicons>['name'] => {
    switch (type) {
      case 'pending_vaccine': return 'time';
      case 'missing_mandatory': return 'alert-circle';
      case 'alert': return 'notifications';
    }
  };

  const getUrgencyColor = (urgency: PendingEntry['urgency']) => {
    switch (urgency) {
      case 'high': return '#DC2626';
      case 'medium': return '#D97706';
      case 'low': return '#6B7280';
    }
  };

  const pendingCount = filteredPending.length;
  const highUrgencyCount = filteredPending.filter((e) => e.urgency === 'high').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="time" size={24} color="#005570" />
          <Text style={styles.headerTitle}>Histórico</Text>
        </View>
      </View>

      {/* Abas */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons name="document-text-outline" size={18} color={activeTab === 'history' ? '#005570' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>Histórico</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Ionicons name="alert-circle-outline" size={18} color={activeTab === 'pending' ? '#005570' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>Pendências</Text>
          {pendingCount > 0 && (
            <View style={[styles.tabBadge, highUrgencyCount > 0 && styles.tabBadgeUrgent]}>
              <Text style={styles.tabBadgeText}>{pendingCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Filtro por perfil */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <Pressable
            style={[styles.filterChip, !filterProfile && styles.filterChipActive]}
            onPress={() => setFilterProfile(null)}
          >
            <Text style={[styles.filterChipText, !filterProfile && styles.filterChipTextActive]}>Todos</Text>
          </Pressable>
          {familyMembers.map((member) => (
            <Pressable
              key={member.id}
              style={[styles.filterChip, filterProfile === member.id && styles.filterChipActive]}
              onPress={() => setFilterProfile(filterProfile === member.id ? null : member.id)}
            >
              <Text style={[styles.filterChipText, filterProfile === member.id && styles.filterChipTextActive]}>
                {member.kind === 'user' ? 'Você' : member.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {activeTab === 'history' ? (
        <>
          {/* Contadores do histórico */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{filteredHistory.filter((e) => e.type !== 'campaign').length}</Text>
              <Text style={styles.statLabel}>Vacinas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{filteredHistory.filter((e) => e.type === 'campaign').length}</Text>
              <Text style={styles.statLabel}>Campanhas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{filteredHistory.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {/* Lista de histórico */}
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {filteredHistory.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
                <Text style={styles.emptySubtext}>Os registros de vacinas e campanhas aparecerão aqui.</Text>
              </View>
            ) : (
              filteredHistory.map((entry) => (
                <View key={`${entry.type}-${entry.id}`} style={styles.historyCard}>
                  <View style={styles.historyCardHeader}>
                    <View style={[styles.typeIconContainer, { backgroundColor: getTypeColor(entry.type) + '15' }]}>
                      <Ionicons name={getTypeIcon(entry.type)} size={20} color={getTypeColor(entry.type)} />
                    </View>
                    <View style={styles.historyCardInfo}>
                      <Text style={styles.historyCardName}>{entry.name}</Text>
                      <View style={styles.historyCardMeta}>
                        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(entry.type) + '20' }]}>
                          <Text style={[styles.typeBadgeText, { color: getTypeColor(entry.type) }]}>{getTypeLabel(entry.type)}</Text>
                        </View>
                        <Text style={styles.profileLabel}>{entry.profileName}</Text>
                      </View>
                    </View>
                  </View>
                  {(entry.date || entry.details) && (
                    <View style={styles.historyCardDetails}>
                      {entry.date && (
                        <View style={styles.detailRow}>
                          <Ionicons name="calendar-outline" size={14} color="#66776b" />
                          <Text style={styles.detailText}>{formatDateToBR(entry.date)}</Text>
                        </View>
                      )}
                      {entry.details && (
                        <View style={styles.detailRow}>
                          <Ionicons name="information-circle-outline" size={14} color="#66776b" />
                          <Text style={styles.detailText}>{entry.details}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        </>
      ) : (
        <>
          {/* Contadores de pendências */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, highUrgencyCount > 0 && { color: '#DC2626' }]}>{highUrgencyCount}</Text>
              <Text style={styles.statLabel}>Urgentes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{filteredPending.filter((e) => e.type === 'missing_mandatory').length}</Text>
              <Text style={styles.statLabel}>Faltantes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {/* Lista de pendências */}
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {filteredPending.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#09BEA5" />
                <Text style={styles.emptyText}>Tudo em dia!</Text>
                <Text style={styles.emptySubtext}>Não há pendências de vacinação no momento.</Text>
              </View>
            ) : (
              filteredPending.map((entry) => (
                <View key={entry.id} style={[styles.historyCard, { borderLeftWidth: 3, borderLeftColor: getUrgencyColor(entry.urgency) }]}>
                  <View style={styles.historyCardHeader}>
                    <View style={[styles.typeIconContainer, { backgroundColor: getPendingTypeColor(entry.type) + '15' }]}>
                      <Ionicons name={getPendingTypeIcon(entry.type)} size={20} color={getPendingTypeColor(entry.type)} />
                    </View>
                    <View style={styles.historyCardInfo}>
                      <Text style={styles.historyCardName}>{entry.name}</Text>
                      <View style={styles.historyCardMeta}>
                        <View style={[styles.typeBadge, { backgroundColor: getPendingTypeColor(entry.type) + '20' }]}>
                          <Text style={[styles.typeBadgeText, { color: getPendingTypeColor(entry.type) }]}>{getPendingTypeLabel(entry.type)}</Text>
                        </View>
                        <Text style={styles.profileLabel}>{entry.profileName}</Text>
                      </View>
                    </View>
                  </View>
                  {(entry.description || entry.dueDate) && (
                    <View style={styles.historyCardDetails}>
                      {entry.description && (
                        <View style={styles.detailRow}>
                          <Ionicons name="information-circle-outline" size={14} color="#66776b" />
                          <Text style={styles.detailText}>{entry.description}</Text>
                        </View>
                      )}
                      {entry.dueDate && (
                        <View style={styles.detailRow}>
                          <Ionicons name="calendar-outline" size={14} color={getUrgencyColor(entry.urgency)} />
                          <Text style={[styles.detailText, { color: getUrgencyColor(entry.urgency), fontWeight: '600' }]}>
                            Prevista: {formatDateToBR(entry.dueDate)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        </>
      )}

      <StatusBar style="dark" />
    </View>
  );
}

async function getMandatoryRecords(): Promise<MandatoryVaccineRecord[]> {
  return getMandatoryVaccineRecords();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAE3E2',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: '12%',
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f3322',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#E8F4F3',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#005570',
  },
  tabBadge: {
    backgroundColor: '#D97706',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeUrgent: {
    backgroundColor: '#DC2626',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  filterContainer: {
    paddingBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8EEE8',
  },
  filterChipActive: {
    backgroundColor: '#29442dff',
    borderColor: '#29442dff',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#66776b',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#005570',
  },
  statLabel: {
    fontSize: 11,
    color: '#66776b',
    marginTop: 2,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#66776b',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  historyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCardInfo: {
    flex: 1,
  },
  historyCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f3322',
    marginBottom: 4,
  },
  historyCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  profileLabel: {
    fontSize: 11,
    color: '#66776b',
    fontWeight: '500',
  },
  historyCardDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#66776b',
  },
});