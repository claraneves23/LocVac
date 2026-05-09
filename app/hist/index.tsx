import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Skeleton from '../../components/redesign/Skeleton';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import { useAppContext } from '../context/AppContext';
import { FamilyMember, Campanha } from '../types/vaccination';
import {
  fetchDosesPorPessoa,
  fetchOutrasVacinasPorPessoa,
  fetchMandatoryVaccines,
  DoseAplicadaDTO,
  VacinaDTO,
} from '../service/mandatoryVaccineService';
import {
  fetchCampaigns,
  fetchParticipacoesByPessoa,
  ParticipacaoDTO,
} from '../service/campaignService';
import {
  fetchNotificacoes,
  marcarNotificacaoComoLida,
  NotificacaoDTO,
} from '../service/notificationService';
import Tag from '../../components/redesign/Tag';
import { colors } from '../theme/tokens';
import styles from './styles';

type ActiveTab = 'history' | 'pending';
type EntryType = 'mandatory' | 'other' | 'campaign';

type ProfileData = {
  member: FamilyMember;
  applied: DoseAplicadaDTO[];
  other: DoseAplicadaDTO[];
  participacoes: ParticipacaoDTO[];
};

type HistoryEntry = {
  key: string;
  type: EntryType;
  name: string;
  date?: string;
  detail?: string;
  member: FamilyMember;
};

type PendingEntry = {
  key: string;
  notificacaoId?: number;
  type: 'vaccine' | 'campaign';
  name: string;
  ageLabel?: string;
  description?: string;
  urgency: 'high' | 'medium' | 'low';
  lida?: boolean;
  member?: FamilyMember;
};

const formatAge = (months: number): string => {
  if (months === 0) return 'Ao nascer';
  if (months === 1) return '1 mês';
  if (months < 12) return `${months} meses`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return y === 1 ? '1 ano' : `${y} anos`;
  return `${y} ano${y > 1 ? 's' : ''} e ${m} mês${m > 1 ? 'es' : ''}`;
};

const formatDateToBR = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const TYPE_TONE: Record<EntryType, 'brand' | 'neutral' | 'ochre'> = {
  mandatory: 'brand',
  other: 'neutral',
  campaign: 'ochre',
};

const TYPE_ICON: Record<EntryType, React.ComponentProps<typeof Ionicons>['name']> = {
  mandatory: 'shield-checkmark',
  other: 'medkit',
  campaign: 'megaphone',
};

const TYPE_LABEL: Record<EntryType, string> = {
  mandatory: 'Obrigatória',
  other: 'Outra vacina',
  campaign: 'Campanha',
};

export default function Search() {
  const { mainUser, dependents } = useAppContext();
  const [activeTab, setActiveTab] = useState<ActiveTab>('history');
  const [filterProfile, setFilterProfile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campanha[]>([]);
  const [mandatoryVaccines, setMandatoryVaccines] = useState<VacinaDTO[]>([]);
  const [profilesData, setProfilesData] = useState<ProfileData[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoDTO[]>([]);

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
        const [mandatories, camps, notifs] = await Promise.all([
          fetchMandatoryVaccines().catch(() => [] as VacinaDTO[]),
          fetchCampaigns(),
          fetchNotificacoes().catch(() => [] as NotificacaoDTO[]),
        ]);
        setMandatoryVaccines(mandatories);
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
        setCampaigns(camps);
        setProfilesData(data);
        setNotificacoes(notifs);
      };

      fetchAll().catch(() => {}).finally(() => setLoading(false));
    }, [mainUser?.id, dependents.length])
  );

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      fetchNotificacoes().then(setNotificacoes).catch(() => {});
    });
    return () => sub.remove();
  }, []);

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
              .filter(Boolean).join(' • ') || undefined,
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
              .filter(Boolean).join(' • ') || undefined,
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

    // Vacinas: calculado localmente — quais a pessoa deveria ter tomado pela idade e ainda não tomou
    profilesData.forEach(({ member, applied }) => {
      if (!member.birthDate) return;
      const [y, mo, d] = member.birthDate.split('-').map(Number);
      const birth = new Date(y, mo - 1, d);
      const now = new Date();
      const personAgeMonths =
        (now.getFullYear() - birth.getFullYear()) * 12 +
        (now.getMonth() - birth.getMonth());

      const appliedIds = new Set(applied.map((dose) => dose.idVacina));

      mandatoryVaccines
        .filter((v) => {
          const minAge = v.idadeMinimaMeses ?? 0;
          return minAge <= personAgeMonths && !appliedIds.has(v.id);
        })
        .forEach((v) => {
          const minAge = v.idadeMinimaMeses ?? 0;
          // Atrasada = faixa etária já passou; no prazo = mês atual
          const urgency: PendingEntry['urgency'] =
            minAge < personAgeMonths ? 'high' : 'medium';
          entries.push({
            key: `pending-${member.id}-${v.id}`,
            type: 'vaccine',
            name: v.nome,
            ageLabel: formatAge(minAge),
            urgency,
            member,
          });
        });
    });

    // Campanhas: vindas do backend
    notificacoes
      .filter((n) => n.tipo === 'NOVA_CAMPANHA')
      .forEach((n) => {
        entries.push({
          key: `notif-${n.id}`,
          notificacaoId: n.id,
          type: 'campaign',
          name: n.titulo,
          description: n.mensagem,
          urgency: 'low',
          lida: n.lida,
          member: n.pessoaId != null
            ? (mainUser?.id === String(n.pessoaId)
                ? mainUser ?? undefined
                : dependents.find((dep) => dep.id === String(n.pessoaId)))
            : undefined,
        });
      });

    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return entries.sort((a, b) => order[a.urgency] - order[b.urgency]);
  }, [mandatoryVaccines, profilesData, notificacoes, mainUser, dependents]);

  const handleTapPending = useCallback((entry: PendingEntry) => {
    if (!entry.notificacaoId || entry.lida) return;
    const id = entry.notificacaoId;
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
    marcarNotificacaoComoLida(id).catch(() => {
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: false } : n))
      );
    });
  }, []);

  const filteredHistory = useMemo(
    () => (!filterProfile ? historyEntries : historyEntries.filter((e) => e.member.id === filterProfile)),
    [historyEntries, filterProfile]
  );
  const filteredPending = useMemo(
    () => (!filterProfile ? pendingEntries : pendingEntries.filter((e) => e.member?.id === filterProfile)),
    [pendingEntries, filterProfile]
  );
  const pendingCount = filteredPending.length;
  const highUrgencyCount = filteredPending.filter((e) => e.urgency === 'high').length;

  const urgencyTone = (u: PendingEntry['urgency']): 'coral' | 'ochre' | 'neutral' =>
    u === 'high' ? 'coral' : u === 'medium' ? 'ochre' : 'neutral';

  return (
    <View style={styles.container}>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons name="document-text-outline" size={16} color={activeTab === 'history' ? colors.brand : colors.ink3} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>Registros</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Ionicons name="alert-circle-outline" size={16} color={activeTab === 'pending' ? colors.brand : colors.ink3} />
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>Pendências</Text>
          {pendingCount > 0 && (
            <View style={styles.tabDot} />
          )}
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterChip, !filterProfile && styles.filterChipActive]}
          onPress={() => setFilterProfile(null)}
        >
          <Text style={[styles.filterChipText, !filterProfile && styles.filterChipTextActive]}>Todos</Text>
        </Pressable>
        {familyMembers.map((m) => {
          const active = filterProfile === m.id;
          return (
            <Pressable
              key={m.id}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilterProfile(active ? null : m.id)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {m.kind === 'user' ? 'Você' : m.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.statsRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.statCard}>
                <Skeleton width={32} height={20} radius={4} style={{ marginBottom: 6 }} />
                <Skeleton width={48} height={10} radius={4} />
              </View>
            ))}
          </View>
          <View style={styles.timeline}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.line, borderColor: colors.bg }]} />
                  {i < 4 && <View style={styles.timelineLine} />}
                </View>
                <View style={[styles.timelineCard, { marginBottom: 10 }]}>
                  <View style={[styles.timelineHeader, { gap: 8 }]}>
                    <Skeleton width={20} height={18} radius={4} />
                    <Skeleton width="55%" height={14} radius={4} />
                  </View>
                  <View style={[styles.timelineMeta, { marginTop: 10 }]}>
                    <Skeleton width={60} height={18} radius={6} />
                    <Skeleton width={72} height={10} radius={4} />
                  </View>
                </View>
              </View>
            ))}
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      ) : activeTab === 'history' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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

          {filteredHistory.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={38} color={colors.ink4} />
              <Text style={styles.emptyTitle}>Nenhum registro encontrado.</Text>
              <Text style={styles.emptySub}>Seus registros de vacinas e campanhas aparecerão aqui.</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {filteredHistory.map((entry, idx) => {
                const tone = TYPE_TONE[entry.type];
                const isLast = idx === filteredHistory.length - 1;
                return (
                  <View key={entry.key} style={styles.timelineRow}>
                    <View style={styles.timelineRail}>
                      <View style={[
                        styles.timelineDot,
                        {
                          backgroundColor:
                            tone === 'brand' ? colors.brand : tone === 'ochre' ? colors.ochre : colors.ink3,
                        },
                      ]} />
                      {!isLast && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineCard}>
                      <View style={styles.timelineHeader}>
                        <Ionicons
                          name={TYPE_ICON[entry.type]}
                          size={18}
                          color={tone === 'brand' ? colors.brand : tone === 'ochre' ? colors.ochre : colors.ink2}
                        />
                        <Text style={styles.timelineName} numberOfLines={1}>{entry.name}</Text>
                      </View>
                      <View style={styles.timelineMeta}>
                        <Tag tone={tone}>{TYPE_LABEL[entry.type]}</Tag>
                        <Text style={styles.timelineMetaText}>
                          {entry.member.kind === 'user' ? 'Você' : entry.member.name}
                        </Text>
                        {entry.date && (
                          <Text style={styles.timelineMetaText}>· {formatDateToBR(entry.date)}</Text>
                        )}
                      </View>
                      {entry.detail && <Text style={styles.timelineDetail}>{entry.detail}</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, highUrgencyCount > 0 && { color: colors.coral }]}>
                {highUrgencyCount}
              </Text>
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

          {filteredPending.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={38} color={colors.success} />
              <Text style={styles.emptyTitle}>Tudo em dia!</Text>
              <Text style={styles.emptySub}>Não há pendências de vacinação no momento.</Text>
            </View>
          ) : (
            filteredPending.map((entry) => {
              const tone = urgencyTone(entry.urgency);
              const accent = tone === 'coral' ? colors.coral : tone === 'ochre' ? colors.ochre : colors.ink3;
              return (
                <Pressable
                  key={entry.key}
                  onPress={() => handleTapPending(entry)}
                  style={[
                    styles.pendingCard,
                    { borderLeftColor: accent },
                    entry.lida && { opacity: 0.55 },
                  ]}
                >
                  <View style={styles.pendingHeader}>
                    <Ionicons
                      name={entry.type === 'vaccine' ? 'alert-circle-outline' : 'megaphone-outline'}
                      size={20}
                      color={accent}
                    />
                    <Text style={styles.pendingName} numberOfLines={1}>{entry.name}</Text>
                    {entry.lida === false && <View style={[styles.unreadDot, { backgroundColor: accent }]} />}
                  </View>
                  <View style={styles.timelineMeta}>
                    <Tag tone={tone}>{entry.type === 'vaccine' ? 'Vacina faltante' : 'Campanha'}</Tag>
                    {entry.ageLabel && (
                      <Text style={styles.timelineMetaText}>· {entry.ageLabel}</Text>
                    )}
                    {entry.member && (
                      <Text style={styles.timelineMetaText}>
                        · {entry.member.kind === 'user' ? 'Você' : entry.member.name}
                      </Text>
                    )}
                  </View>
                  {entry.description && <Text style={styles.timelineDetail}>{entry.description}</Text>}
                </Pressable>
              );
            })
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      <StatusBar style="dark" />
    </View>
  );
}
