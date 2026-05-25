import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  fetchMandatoryVaccines,
  fetchDosesPorPessoa,
  registrarDose,
  atualizarDose,
  deletarDose,
  fetchOutrasVacinasPorPessoa,
  registrarOutraVacina,
  atualizarOutraVacina,
  VacinaDTO,
} from '../../src/service/mandatoryVaccineService';
import {
  addCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignsByProfile,
} from '../../src/storage/campaigns';
import { useAppContext } from '../../src/context/AppContext';
import {
  FamilyMember,
  MandatoryVaccineRecord,
  OtherVaccine,
  ParticipatingCampaign,
} from '../../src/types/vaccination';

import AppHeader from '../../components/redesign/AppHeader';
import Skeleton from '../../components/redesign/Skeleton';
import ProfileModal from '../../components/modals/ProfileModal';
import MandatoryVaccineModal from '../../components/modals/MandatoryVaccineModal';
import QuickFillVaccinesModal from '../../components/modals/QuickFillVaccinesModal';
import OtherVaccineModal from '../../components/modals/OtherVaccineModal';
import CampaignModal from '../../components/modals/CampaignModal';
import { makeStyles } from '../../src/styles/home';
import { useTheme } from '../../src/context/ThemeContext';

const SELECTED_PROFILE_KEY = 'selectedProfileId';

type Filter = 'todas' | 'aplicadas' | 'pendentes' | 'campanhas';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'aplicadas', label: 'Aplicadas' },
  { id: 'pendentes', label: 'Pendentes' },
  { id: 'campanhas', label: 'Campanhas' },
];

const formatDateToBR = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const formatId = (id: string | undefined): string => {
  if (!id) return 'LV-XXXX';
  const padded = id.padStart(4, '0');
  return `LV-${new Date().getFullYear()}-${padded.slice(-4)}`;
};

const formatSex = (sex: 'M' | 'F' | 'Outro' | undefined): string => {
  if (sex === 'M') return 'Masculino';
  if (sex === 'F') return 'Feminino';
  return 'Outro';
};

const formatCNS = (cns: string): string => {
  const d = cns.replace(/\D/g, '');
  if (d.length === 15) return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7, 11)} ${d.slice(11)}`;
  return cns;
};

const ordinalDose = (n: number): string => {
  if (n === 1) return '1ª dose';
  if (n === 2) return '2ª dose';
  if (n === 3) return '3ª dose';
  return `${n}ª dose`;
};

const formatDoseLabel = (v: VacinaDTO): string => {
  if (!v.tipoDose) return '';
  if (v.tipoDose === 'UNICA') return 'Dose única';
  if (v.tipoDose === 'REFORCO') {
    if (!v.numeroDose || v.numeroDose === 1) return 'Reforço';
    return `${v.numeroDose}º reforço`;
  }
  return v.numeroDose ? ordinalDose(v.numeroDose) : '';
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

export default function Index() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { mainUser, dependents } = useAppContext();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>('todas');

  const [mandatoryVaccineList, setMandatoryVaccineList] = useState<VacinaDTO[]>([]);
  const [mandatoryRecords, setMandatoryRecords] = useState<MandatoryVaccineRecord[]>([]);
  const [otherVaccines, setOtherVaccines] = useState<OtherVaccine[]>([]);
  const [campaigns, setCampaigns] = useState<ParticipatingCampaign[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [mandatoryListLoaded, setMandatoryListLoaded] = useState(false);

  // Quick-fill modal state
  const [isQuickFillOpen, setIsQuickFillOpen] = useState(false);

  // Mandatory modal state
  const [isMandatoryModalOpen, setIsMandatoryModalOpen] = useState(false);
  const [editingMandatory, setEditingMandatory] = useState<{ vaccineId: string; record?: MandatoryVaccineRecord } | null>(null);
  const [mandatoryIsApplied, setMandatoryIsApplied] = useState(false);
  const [mandatoryDate, setMandatoryDate] = useState('');
  const [mandatoryLot, setMandatoryLot] = useState('');
  const [mandatoryCode, setMandatoryCode] = useState('');
  const [mandatoryProfName, setMandatoryProfName] = useState('');
  const [mandatoryProfId, setMandatoryProfId] = useState('');
  const [savingMandatory, setSavingMandatory] = useState(false);
  const [mandatoryDateError, setMandatoryDateError] = useState<string | null>(null);

  // Other vaccine modal state
  const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);
  const [editingOther, setEditingOther] = useState<OtherVaccine | null>(null);
  const [otherName, setOtherName] = useState('');
  const [otherDate, setOtherDate] = useState('');
  const [otherLot, setOtherLot] = useState('');
  const [otherCode, setOtherCode] = useState('');
  const [otherProfName, setOtherProfName] = useState('');
  const [otherProfId, setOtherProfId] = useState('');
  const [savingOther, setSavingOther] = useState(false);
  const [otherNameError, setOtherNameError] = useState<string | null>(null);
  const [otherDateError, setOtherDateError] = useState<string | null>(null);

  // Campaign modal state
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<ParticipatingCampaign | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [campaignParticipationDate, setCampaignParticipationDate] = useState('');
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [campaignNameError, setCampaignNameError] = useState<string | null>(null);
  const [campaignDateError, setCampaignDateError] = useState<string | null>(null);

  const familyMembers = useMemo<FamilyMember[]>(() => {
    if (!mainUser) return [];
    return [mainUser, ...dependents];
  }, [mainUser, dependents]);

  const selectedProfile = useMemo<FamilyMember | null>(() => {
    if (!mainUser) return null;
    return familyMembers.find((p) => p.id === selectedProfileId) ?? mainUser;
  }, [familyMembers, selectedProfileId, mainUser]);

  useEffect(() => {
    if (mainUser && !selectedProfileId) {
      setSelectedProfileId(mainUser.id);
    }
  }, [mainUser]);

  useEffect(() => {
    if (selectedProfileId) {
      AsyncStorage.setItem(SELECTED_PROFILE_KEY, selectedProfileId).catch(() => {});
    }
  }, [selectedProfileId]);

  useEffect(() => {
    fetchMandatoryVaccines()
      .then(setMandatoryVaccineList)
      .catch(() => setMandatoryVaccineList([]))
      .finally(() => setMandatoryListLoaded(true));
  }, []);

  const loadData = useCallback(async () => {
    if (!selectedProfileId) return;
    try {
      const [doses, others, localCampaigns] = await Promise.all([
        fetchDosesPorPessoa(Number(selectedProfileId)),
        fetchOutrasVacinasPorPessoa(Number(selectedProfileId)).catch(() => []),
        getCampaignsByProfile(selectedProfileId),
      ]);
      setMandatoryRecords(
        doses.map((d) => ({
          id: String(d.id),
          profileId: String(d.idPessoa),
          vaccineId: String(d.idVacina),
          isApplied: true,
          applicationDate: d.dataAplicacao,
          lot: d.lote ?? undefined,
          code: d.observacao ?? undefined,
          professionalName: d.nomeProfissional ?? undefined,
          professionalId: d.registroProfissional ?? undefined,
        }))
      );
      setOtherVaccines(
        others.map((d) => ({
          id: String(d.id),
          profileId: String(d.idPessoa),
          vaccineName: d.nomeVacina,
          applicationDate: d.dataAplicacao ?? undefined,
          lot: d.lote ?? undefined,
          code: d.observacao ?? undefined,
          professionalName: d.nomeProfissional ?? undefined,
          professionalId: d.registroProfissional ?? undefined,
        }))
      );
      setCampaigns(localCampaigns);
    } catch {
      setMandatoryRecords([]);
      setOtherVaccines([]);
      setCampaigns([]);
    } finally {
      setDataLoaded(true);
    }
  }, [selectedProfileId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const anyModalOpen = isProfileModalOpen || isMandatoryModalOpen || isOtherModalOpen || isCampaignModalOpen || isQuickFillOpen;
  useEffect(() => {
    const updateBars = async () => {
      if (Platform.OS !== 'android') return;
      try {
        if (anyModalOpen) {
          await NavigationBar.setButtonStyleAsync('light');
          await NavigationBar.setVisibilityAsync('visible');
        } else {
          await NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
        }
      } catch {}
    };
    updateBars();
  }, [anyModalOpen, isDark]);

  // ===== Mandatory handlers =====
  const openMandatoryModal = (vaccineId: string) => {
    setMandatoryDateError(null);
    const existingRecord = mandatoryRecords.find((r) => r.vaccineId === vaccineId);
    setEditingMandatory({ vaccineId, record: existingRecord });
    if (existingRecord) {
      setMandatoryIsApplied(existingRecord.isApplied);
      setMandatoryDate(existingRecord.applicationDate || '');
      setMandatoryLot(existingRecord.lot || '');
      setMandatoryCode(existingRecord.code || '');
      setMandatoryProfName(existingRecord.professionalName || '');
      setMandatoryProfId(existingRecord.professionalId || '');
    } else {
      setMandatoryIsApplied(false);
      setMandatoryDate('');
      setMandatoryLot('');
      setMandatoryCode('');
      setMandatoryProfName('');
      setMandatoryProfId('');
    }
    setIsMandatoryModalOpen(true);
  };

  const handleSaveMandatory = async () => {
    if (!editingMandatory || savingMandatory || !selectedProfile) return;
    const { vaccineId, record } = editingMandatory;
    if (mandatoryIsApplied && !mandatoryDate) {
      setMandatoryDateError('Campo obrigatório!');
      return;
    }
    setMandatoryDateError(null);
    const payload = {
      idPessoa: Number(selectedProfile.id),
      idVacina: Number(vaccineId),
      dataAplicacao: mandatoryDate,
      lote: mandatoryLot.trim() || undefined,
      observacao: mandatoryCode.trim() || undefined,
      nomeProfissional: mandatoryProfName.trim() || undefined,
      registroProfissional: mandatoryProfId.trim() || undefined,
    };
    setSavingMandatory(true);
    try {
      if (!mandatoryIsApplied && record?.id) {
        await deletarDose(Number(record.id));
      } else if (mandatoryIsApplied && record?.id) {
        await atualizarDose(Number(record.id), payload);
      } else if (mandatoryIsApplied) {
        await registrarDose(payload);
      }
      await loadData();
      setEditingMandatory(null);
      setIsMandatoryModalOpen(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a vacina.');
    } finally {
      setSavingMandatory(false);
    }
  };

  // ===== Other vaccine handlers =====
  const openOtherModal = (vaccine?: OtherVaccine) => {
    setOtherNameError(null);
    setOtherDateError(null);
    if (vaccine) {
      setEditingOther(vaccine);
      setOtherName(vaccine.vaccineName);
      setOtherDate(vaccine.applicationDate || '');
      setOtherLot(vaccine.lot || '');
      setOtherCode(vaccine.code || '');
      setOtherProfName(vaccine.professionalName || '');
      setOtherProfId(vaccine.professionalId || '');
    } else {
      setEditingOther(null);
      setOtherName('');
      setOtherDate('');
      setOtherLot('');
      setOtherCode('');
      setOtherProfName('');
      setOtherProfId('');
    }
    setIsOtherModalOpen(true);
  };

  const handleSaveOther = async () => {
    if (savingOther || !selectedProfile) return;
    let temErro = false;
    if (!otherName.trim()) {
      setOtherNameError('Campo obrigatório!');
      temErro = true;
    } else {
      setOtherNameError(null);
    }
    if (!otherDate) {
      setOtherDateError('Campo obrigatório!');
      temErro = true;
    } else {
      setOtherDateError(null);
    }
    if (temErro) return;
    const payload = {
      idPessoa: Number(selectedProfile.id),
      nomeVacina: otherName.trim(),
      dataAplicacao: otherDate,
      lote: otherLot.trim() || undefined,
      observacao: otherCode.trim() || undefined,
      nomeProfissional: otherProfName.trim() || undefined,
      registroProfissional: otherProfId.trim() || undefined,
    };
    setSavingOther(true);
    try {
      if (editingOther) await atualizarOutraVacina(Number(editingOther.id), payload);
      else await registrarOutraVacina(payload);
      await loadData();
      setEditingOther(null);
      setIsOtherModalOpen(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a vacina.');
    } finally {
      setSavingOther(false);
    }
  };

  const handleDeleteOther = (vaccineId: string) => {
    Alert.alert('Remover vacina', 'Deseja remover este registro de vacina?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletarDose(Number(vaccineId));
            await loadData();
          } catch {
            Alert.alert('Erro', 'Não foi possível remover a vacina.');
          }
        },
      },
    ]);
  };

  // ===== Campaign handlers =====
  const openCampaignModal = (campaign?: ParticipatingCampaign) => {
    setCampaignNameError(null);
    setCampaignDateError(null);
    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignName(campaign.campaignName);
      setCampaignParticipationDate(campaign.participationDate);
    } else {
      setEditingCampaign(null);
      setCampaignName('');
      setCampaignParticipationDate('');
    }
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = async () => {
    if (savingCampaign || !selectedProfile) return;
    let temErro = false;
    const nomeTrim = campaignName.trim();
    if (!nomeTrim) { setCampaignNameError('Campo obrigatório!'); temErro = true; }
    if (!campaignParticipationDate) { setCampaignDateError('Campo obrigatório!'); temErro = true; }
    if (temErro) return;
    setSavingCampaign(true);
    try {
      if (editingCampaign) {
        await updateCampaign({
          id: editingCampaign.id,
          profileId: selectedProfile.id,
          campaignName: nomeTrim,
          participationDate: campaignParticipationDate,
        });
      } else {
        await addCampaign({
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          profileId: selectedProfile.id,
          campaignName: nomeTrim,
          participationDate: campaignParticipationDate,
        });
      }
      await loadData();
      setEditingCampaign(null);
      setIsCampaignModalOpen(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a participação na campanha.');
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleDeleteCampaign = (id: string) => {
    Alert.alert('Remover campanha', 'Deseja remover esta participação em campanha?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCampaign(id);
            await loadData();
          } catch {
            Alert.alert('Erro', 'Não foi possível remover a participação.');
          }
        },
      },
    ]);
  };

  // ===== Computed =====
  const vaccineGroups = useMemo(() => {
    const map = new Map<number, VacinaDTO[]>();
    mandatoryVaccineList.forEach((v) => {
      const key = v.idadeMinimaMeses ?? 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    });
    const sortedAges = Array.from(map.keys()).sort((a, b) => a - b);

    // Primeiro grupo incompleto — todos os anteriores estão concluídos
    let activeAge: number | null = null;
    for (const age of sortedAges) {
      const allApplied = map.get(age)!.every((v) =>
        mandatoryRecords.some((r) => r.vaccineId === String(v.id) && r.isApplied)
      );
      if (!allApplied) { activeAge = age; break; }
    }

    // Exibe apenas grupos já concluídos + o grupo atual (bloqueia futuros)
    const visibleAges = activeAge === null
      ? sortedAges
      : sortedAges.filter((a) => a <= activeAge!);

    return visibleAges.map((age) => {
      const vaccines = map.get(age)!;
      const isCompleted = vaccines.every((v) =>
        mandatoryRecords.some((r) => r.vaccineId === String(v.id) && r.isApplied)
      );
      return { age, vaccines, isCompleted, isActive: age === activeAge };
    });
  }, [mandatoryVaccineList, mandatoryRecords]);

  const showMandatory = activeFilter === 'todas' || activeFilter === 'aplicadas' || activeFilter === 'pendentes';
  const showOther = activeFilter === 'todas' || activeFilter === 'aplicadas';
  const showCampaigns = activeFilter === 'todas' || activeFilter === 'campanhas';

  if (!mainUser || !selectedProfile) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.brandInk} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        profile={selectedProfile}
        onSwitch={() => setIsProfileModalOpen(true)}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero passport card */}
        <LinearGradient
          colors={[colors.brand, colors.brand2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.passport}
        >
          <View style={styles.passportTopRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.passportCardLabel}>Informações de Pessoa</Text>
              <Text style={styles.passportName} numberOfLines={2}>{selectedProfile.name}</Text>
              <Text style={styles.passportRole}>
                {selectedProfile.kind === 'dependent' && selectedProfile.relationship
                  ? selectedProfile.relationship
                  : 'Titular'} · {formatId(selectedProfile.id)}
              </Text>
            </View>
          </View>

          <View style={styles.passportDivider} />

          <View style={styles.passportInfoGrid}>
            <View style={styles.passportInfoRow}>
              <View style={styles.passportInfoItem}>
                <Text style={styles.passportInfoLabel}>Nascimento</Text>
                <Text style={styles.passportInfoValue}>{formatDateToBR(selectedProfile.birthDate)}</Text>
              </View>
              <View style={styles.passportInfoItem}>
                <Text style={styles.passportInfoLabel}>Sexo</Text>
                <Text style={styles.passportInfoValue}>{formatSex(selectedProfile.sex)}</Text>
              </View>
            </View>

            {(selectedProfile.city || selectedProfile.state || selectedProfile.birthPlace) && (
              <View style={styles.passportInfoRow}>
                {(selectedProfile.city || selectedProfile.state) ? (
                  <View style={styles.passportInfoItem}>
                    <Text style={styles.passportInfoLabel}>Município/UF</Text>
                    <Text style={styles.passportInfoValue} numberOfLines={1}>
                      {[selectedProfile.city, selectedProfile.state].filter(Boolean).join(' - ')}
                    </Text>
                  </View>
                ) : null}
                {selectedProfile.birthPlace ? (
                  <View style={styles.passportInfoItem}>
                    <Text style={styles.passportInfoLabel}>Local de Nasc.</Text>
                    <Text style={styles.passportInfoValue} numberOfLines={1}>{selectedProfile.birthPlace}</Text>
                  </View>
                ) : null}
              </View>
            )}

            {selectedProfile.cns ? (
              <View style={styles.passportInfoItem}>
                <Text style={styles.passportInfoLabel}>CNS</Text>
                <Text style={styles.passportInfoValue}>{formatCNS(selectedProfile.cns)}</Text>
              </View>
            ) : null}

            {selectedProfile.kind === 'dependent' && selectedProfile.guardianName ? (
              <View style={styles.passportInfoItem}>
                <Text style={styles.passportInfoLabel}>Responsável</Text>
                <Text style={styles.passportInfoValue} numberOfLines={1}>{selectedProfile.guardianName}</Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setActiveFilter(f.id)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {(!dataLoaded || !mandatoryListLoaded) ? (
          <IndexSkeleton />
        ) : (
        <>
        {/* Obrigatórias */}
        {showMandatory && (
          <View style={styles.section}>
            <SectionHeader
              title="Obrigatórias"
              count={`${mandatoryRecords.length}/${mandatoryVaccineList.length}`}
              onQuickFill={() => setIsQuickFillOpen(true)}
            />
            {vaccineGroups.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Nenhuma vacina nesta categoria.</Text>
              </View>
            ) : (
              vaccineGroups.map(({ age, vaccines, isCompleted, isActive }) => {
                const visibleVaccines = vaccines.filter((v) => {
                  const rec = mandatoryRecords.find((r) => r.vaccineId === String(v.id));
                  if (activeFilter === 'aplicadas') return !!rec?.isApplied;
                  if (activeFilter === 'pendentes') return !rec?.isApplied;
                  return true;
                });
                if (visibleVaccines.length === 0) return null;
                return (
                  <View key={age}>
                    <View style={styles.groupHeader}>
                      <Text style={styles.groupLabel}>{formatAge(age)}</Text>
                      {isCompleted && (
                        <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                      )}
                      {isActive && (
                        <View style={styles.groupActiveBadge}>
                          <Text style={styles.groupActiveBadgeText}>atual</Text>
                        </View>
                      )}
                    </View>
                    {visibleVaccines.map((v) => {
                      const record = mandatoryRecords.find((r) => r.vaccineId === String(v.id));
                      const applied = !!record?.isApplied;
                      return (
                        <Pressable
                          key={v.id}
                          style={styles.itemCard}
                          onPress={() => openMandatoryModal(String(v.id))}
                        >
                          <View style={[styles.itemIcon, { backgroundColor: applied ? colors.successSoft : colors.bgMuted }]}>
                            <Ionicons
                              name={applied ? 'shield-checkmark' : 'shield-outline'}
                              size={20}
                              color={applied ? colors.success : colors.ink3}
                            />
                          </View>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={styles.itemTitle} numberOfLines={1}>
                              {v.nome}
                              {formatDoseLabel(v) ? <Text style={styles.itemDose}>{` · ${formatDoseLabel(v)}`}</Text> : null}
                            </Text>
                            {applied && record?.applicationDate && (
                              <Text style={styles.itemSub} numberOfLines={1}>
                                Aplicada em {formatDateToBR(record.applicationDate)}
                              </Text>
                            )}
                          </View>
                          <Ionicons
                            name={applied ? 'checkmark-circle' : 'ellipse-outline'}
                            size={22}
                            color={applied ? colors.success : colors.ink4}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Outras vacinas */}
        {showOther && (
          <View style={styles.section}>
            <SectionHeader
              title="Outras vacinas"
              count={otherVaccines.length}
              onAdd={() => openOtherModal()}
            />
            {otherVaccines.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Nenhuma vacina adicional registrada.</Text>
              </View>
            ) : (
              otherVaccines.map((v) => (
                <View key={v.id} style={styles.itemCard}>
                  <View style={[styles.itemIcon, { backgroundColor: colors.brandSoft }]}>
                    <Ionicons name="medkit-outline" size={20} color={colors.brandInk} />
                  </View>
                  <Pressable style={{ flex: 1, minWidth: 0 }} onPress={() => openOtherModal(v)}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{v.vaccineName}</Text>
                    {v.applicationDate && (
                      <Text style={styles.itemSub} numberOfLines={1}>
                        Aplicada em {formatDateToBR(v.applicationDate)}
                      </Text>
                    )}
                  </Pressable>
                  <Pressable onPress={() => handleDeleteOther(v.id)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        )}

        {/* Campanhas */}
        {showCampaigns && (
          <View style={styles.section}>
            <SectionHeader
              title="Campanhas"
              count={campaigns.length}
              onAdd={() => openCampaignModal()}
            />
            {campaigns.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Nenhuma campanha registrada.</Text>
              </View>
            ) : (
              campaigns.map((c) => (
                <View key={c.id} style={styles.itemCard}>
                  <View style={[styles.itemIcon, { backgroundColor: colors.ochreSoft }]}>
                    <Ionicons name="megaphone-outline" size={20} color={colors.ochreInk} />
                  </View>
                  <Pressable style={{ flex: 1, minWidth: 0 }} onPress={() => openCampaignModal(c)}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{c.campaignName}</Text>
                    <Text style={styles.itemSub} numberOfLines={1}>
                      {formatDateToBR(c.participationDate)}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => handleDeleteCampaign(c.id)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 24 }} />
        </>
        )}
      </ScrollView>

      <ProfileModal
        visible={isProfileModalOpen}
        familyMembers={familyMembers}
        selectedProfileId={selectedProfileId}
        onSelectProfile={setSelectedProfileId}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <QuickFillVaccinesModal
        visible={isQuickFillOpen}
        vaccines={mandatoryVaccineList}
        records={mandatoryRecords}
        pessoaId={selectedProfile ? Number(selectedProfile.id) : null}
        onClose={() => setIsQuickFillOpen(false)}
        onSaved={loadData}
      />

      <MandatoryVaccineModal
        visible={isMandatoryModalOpen}
        vaccineId={editingMandatory?.vaccineId ?? null}
        vaccineName={mandatoryVaccineList.find((v) => String(v.id) === editingMandatory?.vaccineId)?.nome}
        isApplied={mandatoryIsApplied}
        date={mandatoryDate}
        lot={mandatoryLot}
        code={mandatoryCode}
        profName={mandatoryProfName}
        profId={mandatoryProfId}
        onToggleApplied={() => setMandatoryIsApplied(!mandatoryIsApplied)}
        onChangeDate={(iso) => { setMandatoryDate(iso); setMandatoryDateError(null); }}
        onChangeLot={setMandatoryLot}
        onChangeCode={setMandatoryCode}
        onChangeProfName={setMandatoryProfName}
        onChangeProfId={setMandatoryProfId}
        onSave={handleSaveMandatory}
        onClose={() => setIsMandatoryModalOpen(false)}
        saving={savingMandatory}
        dateError={mandatoryDateError ?? undefined}
      />

      <OtherVaccineModal
        visible={isOtherModalOpen}
        isEditing={!!editingOther}
        name={otherName}
        date={otherDate}
        lot={otherLot}
        code={otherCode}
        profName={otherProfName}
        profId={otherProfId}
        onChangeName={(v) => { setOtherName(v); if (otherNameError) setOtherNameError(null); }}
        onChangeDate={(iso) => { setOtherDate(iso); setOtherDateError(null); }}
        onChangeLot={setOtherLot}
        onChangeCode={setOtherCode}
        onChangeProfName={setOtherProfName}
        onChangeProfId={setOtherProfId}
        onSave={handleSaveOther}
        onClose={() => setIsOtherModalOpen(false)}
        saving={savingOther}
        nameError={otherNameError ?? undefined}
        dateError={otherDateError ?? undefined}
      />

      <CampaignModal
        visible={isCampaignModalOpen}
        isEditing={!!editingCampaign}
        campaignName={campaignName}
        participationDate={campaignParticipationDate}
        onChangeCampaignName={(name) => {
          setCampaignName(name);
          if (campaignNameError) setCampaignNameError(null);
        }}
        onChangeParticipationDate={(iso) => { setCampaignParticipationDate(iso); setCampaignDateError(null); }}
        onSave={handleSaveCampaign}
        onClose={() => setIsCampaignModalOpen(false)}
        saving={savingCampaign}
        campaignNameError={campaignNameError ?? undefined}
        participationDateError={campaignDateError ?? undefined}
      />

      <StatusBar style={anyModalOpen ? 'light' : 'dark'} />
    </View>
  );
}

function SectionHeader({
  title,
  count,
  onAdd,
  onQuickFill,
}: {
  title: string;
  count: string | number;
  onAdd?: () => void;
  onQuickFill?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{count}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {onQuickFill && (
          <Pressable onPress={onQuickFill} style={styles.quickFillBtn} hitSlop={6}>
            <Ionicons name="list" size={18} color={colors.brandInk} />
          </Pressable>
        )}
        {onAdd && (
          <Pressable onPress={onAdd} style={styles.addBtn}>
            <Ionicons name="add" size={16} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function IndexSkeleton() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const sectionWidths = [100, 80, 68] as const;
  return (
    <>
      {sectionWidths.map((w, si) => (
        <View key={si} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Skeleton width={w} height={16} radius={6} />
              <Skeleton width={28} height={14} radius={6} />
            </View>
          </View>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.itemCard}>
              <Skeleton width={40} height={40} radius={10} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width="62%" height={14} radius={4} />
                <Skeleton width="42%" height={11} radius={4} />
              </View>
              <Skeleton width={22} height={22} radius={11} />
            </View>
          ))}
        </View>
      ))}
      <View style={{ height: 24 }} />
    </>
  );
}
