import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppContext } from './context/AppContext';
import { FamilyMember, Campanha } from './types/vaccination';
import {
  fetchDosesPorPessoa,
  fetchOutrasVacinasPorPessoa,
  fetchMandatoryVaccines,
  DoseAplicadaDTO,
  VacinaDTO,
} from './service/mandatoryVaccineService';
import {
  fetchCampaigns,
  fetchParticipacoesByPessoa,
  ParticipacaoDTO,
} from './service/campaignService';
import { getRecommendedAgeMonths, getAgeInMonths } from './utils/vaccineAge';

type ActiveTab = 'history' | 'pending';

type ProfileData = {
  member: FamilyMember;
  applied: DoseAplicadaDTO[];
  other: DoseAplicadaDTO[];
  participacoes: ParticipacaoDTO[];
};

type HistoryEntry = {
  key: string;
  type: 'mandatory' | 'other' | 'campaign';
  name: string;
  date?: string;
  detail?: string;
  member: FamilyMember;
};

type PendingEntry = {
  key: string;
  type: 'vaccine' | 'campaign';
  name: string;
  description?: string;
  deadline?: string;
  urgency: 'high' | 'medium' | 'low';
  member: FamilyMember;
};

const formatDateToBR = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

export default function Search() {
  const { mainUser, dependents } = useAppContext();

  const [activeTab, setActiveTab] = useState<ActiveTab>('history');
  const [filterProfile, setFilterProfile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mandatoryVaccines, setMandatoryVaccines] = useState<VacinaDTO[]>([]);
  const [campaigns, setCampaigns] = useState<Campanha[]>([]);
  const [profilesData, setProfilesData] = useState<ProfileData[]>([]);

  const familyMembers = useMemo<FamilyMember[]>(
    () => (mainUser ? [mainUser, ...dependents] : []),
    [mainUser, dependents]
  );

  useFocusEffect(
    useCallback(() => {
      if (!mainUser) return;
      const members: FamilyMember[] = [mainUser, ...dependents];
      setLoading(true);

      const fetchAll = async () => {
        const [mandatory, camps] = await Promise.all([
          fetchMandatoryVaccines(),
          fetchCampaigns(),
        ]);
        const data = await Promise.all(
          members.map(async (member) => {
            const [applied, other, participacoes] = await Promise.all([
              fetchDosesPorPessoa(Number(member.id)),
              fetchOutrasVacinasPorPessoa(Number(member.id)),
              fetchParticipacoesByPessoa(Number(member.id)),
            ]);
            return { member, applied, other, participacoes };
          })
        );
        setMandatoryVaccines(mandatory);
        setCampaigns(camps);
        setProfilesData(data);
      };

      fetchAll().catch(() => {}).finally(() => setLoading(false));
    }, [mainUser?.id, dependents.length])
  );

  const historyEntries = useMemo<HistoryEntry[]>(() => {
    const entries: HistoryEntry[] = [];

    profilesData.forEach(({ member, applied, other, participacoes }) => {
      applied.forEach((dose) => {
        entries.push({
          key: `mandatory-${dose.id}`,
          type: 'mandatory',
          name: dose.nomeVacina,
          date: dose.dataAplicacao,
          detail:
            [dose.lote && `Lote: ${dose.lote}`, dose.nomeProfissional && `Prof: ${dose.nomeProfissional}`]
              .filter(Boolean)
              .join(' • ') || undefined,
          member,
        });
      });

      other.forEach((dose) => {
        entries.push({
          key: `other-${dose.id}`,
          type: 'other',
          name: dose.nomeVacina,
          date: dose.dataAplicacao,
          detail:
            [dose.lote && `Lote: ${dose.lote}`, dose.unidadeSaude && `Local: ${dose.unidadeSaude}`]
              .filter(Boolean)
              .join(' • ') || undefined,
          member,
        });
      });

      participacoes.forEach((p) => {
        const camp = campaigns.find((c) => c.id === p.idCampanha);
        entries.push({
          key: `camp-${p.id}`,
          type: 'campaign',
          name: camp?.nome ?? p.nomeCampanha ?? `Campanha #${p.idCampanha}`,
          date: p.dataParticipacao,
          member,
        });
      });
    });

    return entries.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });
  }, [profilesData, campaigns]);

  const pendingEntries = useMemo<PendingEntry[]>(() => {
    const entries: PendingEntry[] = [];

    profilesData.forEach(({ member, applied, participacoes }) => {
      const appliedIds = new Set(applied.map((d) => d.idVacina));
      const ageMonths = getAgeInMonths(member.birthDate);

      // Encontra a próxima vacina obrigatória faltante na progressão:
      // deve ser a primeira (na ordem retornada pela API) que o perfil ainda
      // não tomou E cuja idade recomendada já foi atingida.
      const nextMissing = mandatoryVaccines.find(
        (v) => !appliedIds.has(v.id) && ageMonths >= getRecommendedAgeMonths(v)
      );

      if (nextMissing) {
        entries.push({
          key: `missing-${member.id}-${nextMissing.id}`,
          type: 'vaccine',
          name: nextMissing.nome,
          description: nextMissing.descricao,
          urgency: 'medium',
          member,
        });
      }

      const joinedIds = new Set(participacoes.map((p) => p.idCampanha));
      campaigns
        .filter((c) => c.ativa && !joinedIds.has(c.id))
        .forEach((c) => {
          entries.push({
            key: `pending-camp-${member.id}-${c.id}`,
            type: 'campaign',
            name: c.nome,
            description: `Público-alvo: ${c.publicoAlvo}`,
            deadline: c.dataFim,
            urgency: 'low',
            member,
          });
        });
    });

    const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return entries.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
  }, [profilesData, mandatoryVaccines, campaigns]);

  const filteredHistory = useMemo(
    () => (!filterProfile ? historyEntries : historyEntries.filter((e) => e.member.id === filterProfile)),
    [historyEntries, filterProfile]
  );

  const filteredPending = useMemo(
    () => (!filterProfile ? pendingEntries : pendingEntries.filter((e) => e.member.id === filterProfile)),
    [pendingEntries, filterProfile]
  );

  const pendingCount = filteredPending.length;
  const highUrgencyCount = filteredPending.filter((e) => e.urgency === 'high').length;

  const getTypeLabel = (type: HistoryEntry['type']) => {
    if (type === 'mandatory') return 'Obrigatória';
    if (type === 'other') return 'Outra Vacina';
    return 'Campanha';
  };

  const getTypeColor = (type: HistoryEntry['type']) => {
    if (type === 'mandatory') return '#005570';
    if (type === 'other') return '#6B7280';
    return '#D97706';
  };

  const getTypeIcon = (type: HistoryEntry['type']): React.ComponentProps<typeof Ionicons>['name'] => {
    if (type === 'mandatory') return 'shield-checkmark';
    if (type === 'other') return 'medical';
    return 'megaphone';
  };

  const getPendingTypeLabel = (type: PendingEntry['type']) =>
    type === 'vaccine' ? 'Vacina Faltante' : 'Campanha';

  const getPendingTypeColor = (type: PendingEntry['type']) =>
    type === 'vaccine' ? '#DC2626' : '#D97706';

  const getPendingTypeIcon = (type: PendingEntry['type']): React.ComponentProps<typeof Ionicons>['name'] =>
    type === 'vaccine' ? 'alert-circle' : 'megaphone';

  const getUrgencyColor = (urgency: PendingEntry['urgency']) => {
    if (urgency === 'high') return '#DC2626';
    if (urgency === 'medium') return '#D97706';
    return '#6B7280';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="time" size={24} color="#005570" />
          <Text style={styles.headerTitle}>Histórico</Text>
        </View>
      </View>

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005570" />
        </View>
      ) : activeTab === 'history' ? (
        <>
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

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {filteredHistory.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
                <Text style={styles.emptySubtext}>Os registros de vacinas e campanhas aparecerão aqui.</Text>
              </View>
            ) : (
              filteredHistory.map((entry) => (
                <View key={entry.key} style={styles.historyCard}>
                  <View style={styles.historyCardHeader}>
                    <View style={[styles.typeIconContainer, { backgroundColor: getTypeColor(entry.type) + '15' }]}>
                      <Ionicons name={getTypeIcon(entry.type)} size={20} color={getTypeColor(entry.type)} />
                    </View>
                    <View style={styles.historyCardInfo}>
                      <Text style={styles.historyCardName}>{entry.name}</Text>
                      <View style={styles.historyCardMeta}>
                        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(entry.type) + '20' }]}>
                          <Text style={[styles.typeBadgeText, { color: getTypeColor(entry.type) }]}>
                            {getTypeLabel(entry.type)}
                          </Text>
                        </View>
                        <Text style={styles.profileLabel}>
                          {entry.member.kind === 'user' ? 'Você' : entry.member.name}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {(entry.date || entry.detail) && (
                    <View style={styles.historyCardDetails}>
                      {entry.date && (
                        <View style={styles.detailRow}>
                          <Ionicons name="calendar-outline" size={14} color="#66776b" />
                          <Text style={styles.detailText}>{formatDateToBR(entry.date)}</Text>
                        </View>
                      )}
                      {entry.detail && (
                        <View style={styles.detailRow}>
                          <Ionicons name="information-circle-outline" size={14} color="#66776b" />
                          <Text style={styles.detailText}>{entry.detail}</Text>
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
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, highUrgencyCount > 0 && { color: '#DC2626' }]}>{highUrgencyCount}</Text>
              <Text style={styles.statLabel}>Urgentes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{filteredPending.filter((e) => e.type === 'vaccine').length}</Text>
              <Text style={styles.statLabel}>Faltantes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {filteredPending.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#09BEA5" />
                <Text style={styles.emptyText}>Tudo em dia!</Text>
                <Text style={styles.emptySubtext}>Não há pendências de vacinação no momento.</Text>
              </View>
            ) : (
              filteredPending.map((entry) => (
                <View key={entry.key} style={[styles.historyCard, { borderLeftWidth: 3, borderLeftColor: getUrgencyColor(entry.urgency) }]}>
                  <View style={styles.historyCardHeader}>
                    <View style={[styles.typeIconContainer, { backgroundColor: getPendingTypeColor(entry.type) + '15' }]}>
                      <Ionicons name={getPendingTypeIcon(entry.type)} size={20} color={getPendingTypeColor(entry.type)} />
                    </View>
                    <View style={styles.historyCardInfo}>
                      <Text style={styles.historyCardName}>{entry.name}</Text>
                      <View style={styles.historyCardMeta}>
                        <View style={[styles.typeBadge, { backgroundColor: getPendingTypeColor(entry.type) + '20' }]}>
                          <Text style={[styles.typeBadgeText, { color: getPendingTypeColor(entry.type) }]}>
                            {getPendingTypeLabel(entry.type)}
                          </Text>
                        </View>
                        <Text style={styles.profileLabel}>
                          {entry.member.kind === 'user' ? 'Você' : entry.member.name}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {(entry.description || entry.deadline) && (
                    <View style={styles.historyCardDetails}>
                      {entry.description && (
                        <View style={styles.detailRow}>
                          <Ionicons name="information-circle-outline" size={14} color="#66776b" />
                          <Text style={styles.detailText}>{entry.description}</Text>
                        </View>
                      )}
                      {entry.deadline && (
                        <View style={styles.detailRow}>
                          <Ionicons name="calendar-outline" size={14} color={getUrgencyColor(entry.urgency)} />
                          <Text style={[styles.detailText, { color: getUrgencyColor(entry.urgency), fontWeight: '600' }]}>
                            Válida até: {formatDateToBR(entry.deadline)}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
