import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, ScrollView, Image, Modal, Platform, TextInput, Alert } from 'react-native';
// Removido Picker, usaremos Pressable + Modal
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ALERTS_BY_PROFILE, MAIN_USER } from './data/family';
import { Dependent, FamilyMember, VaccineApplication, MandatoryVaccineRecord, OtherVaccine, ParticipatingCampaign } from './types/vaccination';
import { getDependents } from '../src/storage/dependents';
import { getVaccines, addVaccine, updateVaccine, deleteVaccine } from '../src/storage/vaccines';
import { MANDATORY_FIRST_YEAR_VACCINES } from './data/mandatory-vaccines';
import { getMandatoryVaccineRecordsByProfile, updateMandatoryVaccineRecord } from '../src/storage/mandatory-vaccines';
import { getOtherVaccinesByProfile, addOtherVaccine, updateOtherVaccine, deleteOtherVaccine } from '../src/storage/other-vaccines';
import { getCampaignsByProfile, addCampaign, updateCampaign, deleteCampaign } from '../src/storage/campaigns';
import { fetchCampaigns, addParticipacaoCampanha } from './service/campaignService';
import { Campanha } from './types/vaccination';

// Funções auxiliares para formatação de data
const formatDateToBR = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const formatDateToISO = (brDate: string): string => {
  if (!brDate) return '';
  const [day, month, year] = brDate.split('/');
  return `${year}-${month}-${day}`;
};

const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return new Date(dateStr);
};

const SELECTED_PROFILE_KEY = 'selectedProfileId';

export default function Index() {
  const router = useRouter();
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [vaccines, setVaccines] = useState<VaccineApplication[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddVaccineModalOpen, setIsAddVaccineModalOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<VaccineApplication | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null);
  const [mandatoryVaccineRecords, setMandatoryVaccineRecords] = useState<MandatoryVaccineRecord[]>([]);
  const [isMandatoryVaccineModalOpen, setIsMandatoryVaccineModalOpen] = useState(false);
  const [editingMandatoryVaccine, setEditingMandatoryVaccine] = useState<{ vaccineId: string; record?: MandatoryVaccineRecord } | null>(null);
  const [showMandatoryDatePicker, setShowMandatoryDatePicker] = useState(false);
  const [mandatoryVaccineDate, setMandatoryVaccineDate] = useState(new Date());

  // Estados para o formulário de vacina obrigatória
  const [mandatoryIsApplied, setMandatoryIsApplied] = useState(false);
  const [mandatoryDate, setMandatoryDate] = useState('');
  const [mandatoryLot, setMandatoryLot] = useState('');
  const [mandatoryCode, setMandatoryCode] = useState('');
  const [mandatoryProfName, setMandatoryProfName] = useState('');
  const [mandatoryProfId, setMandatoryProfId] = useState('');

  // Estados para o formulário de adicionar vacina
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newVaccineDate, setNewVaccineDate] = useState('');
  const [newVaccineLot, setNewVaccineLot] = useState('');
  const [newVaccineHealthUnit, setNewVaccineHealthUnit] = useState('');
  const [newVaccineNotes, setNewVaccineNotes] = useState('');

  // Estados para outras vacinas
  const [otherVaccines, setOtherVaccines] = useState<OtherVaccine[]>([]);
  const [isOtherVaccineModalOpen, setIsOtherVaccineModalOpen] = useState(false);
  const [editingOtherVaccine, setEditingOtherVaccine] = useState<OtherVaccine | null>(null);
  const [showOtherVaccineDatePicker, setShowOtherVaccineDatePicker] = useState(false);
  const [otherVaccineDate, setOtherVaccineDate] = useState(new Date());
  const [otherVaccineName, setOtherVaccineName] = useState('');
  const [otherVaccineAppDate, setOtherVaccineAppDate] = useState('');
  const [otherVaccineLot, setOtherVaccineLot] = useState('');
  const [otherVaccineCode, setOtherVaccineCode] = useState('');
  const [otherVaccineProfName, setOtherVaccineProfName] = useState('');
  const [otherVaccineProfId, setOtherVaccineProfId] = useState('');

  // Estados para campanhas
  const [campaigns, setCampaigns] = useState<ParticipatingCampaign[]>([]);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campanha[]>([]);
  const [showCampaignPicker, setShowCampaignPicker] = useState(false);
    // Carregar campanhas disponíveis do backend para o select
    useEffect(() => {
      fetchCampaigns()
        .then(setAvailableCampaigns)
        .catch(() => setAvailableCampaigns([]));
    }, []);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<ParticipatingCampaign | null>(null);
  const [showCampaignDatePicker, setShowCampaignDatePicker] = useState(false);
  const [campaignDate, setCampaignDate] = useState(new Date());
  const [campaignName, setCampaignName] = useState('');
  const [campaignParticipationDate, setCampaignParticipationDate] = useState('');

  const loadDependents = useCallback(async () => {
    const stored = await getDependents();
    setDependents(stored);
  }, []);

  const loadVaccines = useCallback(async () => {
    const stored = await getVaccines();
    setVaccines(stored);
  }, []);

  const loadMandatoryVaccineRecords = useCallback(async () => {
    if (selectedProfileId) {
      const records = await getMandatoryVaccineRecordsByProfile(selectedProfileId);
      setMandatoryVaccineRecords(records);
    }
  }, [selectedProfileId]);

  const loadOtherVaccines = useCallback(async () => {
    if (selectedProfileId) {
      const vaccines = await getOtherVaccinesByProfile(selectedProfileId);
      setOtherVaccines(vaccines);
    }
  }, [selectedProfileId]);

  const loadCampaigns = useCallback(async () => {
    if (selectedProfileId) {
      const campaignsData = await getCampaignsByProfile(selectedProfileId);
      setCampaigns(campaignsData);
    }
  }, [selectedProfileId]);

  // Carregar o perfil salvo ao iniciar
  useEffect(() => {
    const loadSavedProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem(SELECTED_PROFILE_KEY);
        if (saved) {
          setSelectedProfileId(saved);
        } else {
          setSelectedProfileId(MAIN_USER.id);
        }
      } catch (error) {
        console.log('Erro ao carregar perfil salvo:', error);
        setSelectedProfileId(MAIN_USER.id);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedProfile();
  }, []);

  // Salvar o perfil sempre que muda
  useEffect(() => {
    if (selectedProfileId) {
      AsyncStorage.setItem(SELECTED_PROFILE_KEY, selectedProfileId).catch((error) => {
        console.log('Erro ao salvar perfil:', error);
      });
    }
  }, [selectedProfileId]);

  useFocusEffect(
    useCallback(() => {
      loadDependents();
      loadVaccines();
      loadMandatoryVaccineRecords();
      loadOtherVaccines();
      loadCampaigns();
    }, [loadDependents, loadVaccines, loadMandatoryVaccineRecords, loadOtherVaccines, loadCampaigns])
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
        kind: 'user',
        address: MAIN_USER.address,
        city: MAIN_USER.city,
        state: MAIN_USER.state,
        zipCode: MAIN_USER.zipCode,
        phone: MAIN_USER.phone,
      },
      ...dependents.map((dependent) => ({
        id: dependent.id,
        userId: dependent.userId,
        name: dependent.name,
        birthDate: dependent.birthDate,
        birthPlace: dependent.birthPlace,
        sex: dependent.sex,
        kind: 'dependent' as const,
        relationship: dependent.relationship,
        guardianName: dependent.guardianName,
        photoUri: dependent.photoUri,
        address: dependent.address,
        city: dependent.city,
        state: dependent.state,
        zipCode: dependent.zipCode,
        phone: dependent.phone,
      })),
    ],
    [dependents]
  );

  const selectedProfile = useMemo(() => {
    const fallback: FamilyMember = {
      id: MAIN_USER.id,
      userId: MAIN_USER.id,
      name: MAIN_USER.name,
      birthDate: MAIN_USER.birthDate,
      birthPlace: MAIN_USER.birthPlace,
      sex: MAIN_USER.sex,
      kind: 'user',
      address: MAIN_USER.address,
      city: MAIN_USER.city,
      state: MAIN_USER.state,
      zipCode: MAIN_USER.zipCode,
      phone: MAIN_USER.phone,
    };

    if (!selectedProfileId) return fallback;
    return familyMembers.find((profile) => profile.id === selectedProfileId) ?? fallback;
  }, [familyMembers, selectedProfileId]);

  useFocusEffect(
    useCallback(() => {
      if (!familyMembers.some((profile) => profile.id === selectedProfileId)) {
        setSelectedProfileId(MAIN_USER.id);
      }
    }, [familyMembers, selectedProfileId])
  );

  useEffect(() => {
    const updateSystemBars = async () => {
      if (Platform.OS !== 'android') return;
      
      try {
        if (isProfileModalOpen) {
          // Escurece as barras do sistema quando o modal abre
          await NavigationBar.setBackgroundColorAsync('#80000000'); // 50% preto
          await NavigationBar.setButtonStyleAsync('light');
          await NavigationBar.setVisibilityAsync('visible');
        } else {
          // Restaura as barras do sistema quando o modal fecha
          await NavigationBar.setBackgroundColorAsync('#00FFFFFF'); // Branco transparente
          await NavigationBar.setButtonStyleAsync('dark');
        }
      } catch (error) {
        // No Expo Go, algumas APIs podem não funcionar - isso é normal
        console.log('NavigationBar API não disponível no Expo Go');
      }
    };
    updateSystemBars();
  }, [isProfileModalOpen]);

  const openAddVaccineModal = () => {
    setEditingVaccine(null);
    setNewVaccineName('');
    const today = new Date();
    setSelectedDate(today);
    setNewVaccineDate(today.toISOString().split('T')[0]);
    setNewVaccineLot('');
    setNewVaccineHealthUnit('');
    setNewVaccineNotes('');
    setIsAddVaccineModalOpen(true);
  };

  const openEditVaccineModal = (vaccine: VaccineApplication) => {
    setEditingVaccine(vaccine);
    setNewVaccineName(vaccine.vaccineName);
    const date = vaccine.applicationDate ? parseDate(vaccine.applicationDate) : new Date();
    setSelectedDate(date);
    setNewVaccineDate(vaccine.applicationDate || '');
    setNewVaccineLot(vaccine.lot || '');
    setNewVaccineHealthUnit(vaccine.healthUnit || '');
    setNewVaccineNotes(vaccine.notes || '');
    setIsAddVaccineModalOpen(true);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      const isoDate = date.toISOString().split('T')[0];
      setNewVaccineDate(isoDate);
    }
  };

  const handleDeleteVaccine = async (vaccineId: string) => {
    await deleteVaccine(vaccineId);
    await loadVaccines();
  };

  const handleAddVaccine = async () => {
    if (!newVaccineName.trim()) {
      alert('Por favor, informe o nome da vacina.');
      return;
    }

    if (editingVaccine) {
      // Editar vacina existente
      const updatedVaccine: VaccineApplication = {
        ...editingVaccine,
        vaccineName: newVaccineName.trim(),
        applicationDate: newVaccineDate || undefined,
        lot: newVaccineLot.trim() || undefined,
        healthUnit: newVaccineHealthUnit.trim() || undefined,
        notes: newVaccineNotes.trim() || undefined,
      };
      await updateVaccine(updatedVaccine);
    } else {
      // Adicionar nova vacina
      const newVaccine: VaccineApplication = {
        id: `vac-${Date.now()}`,
        profileId: selectedProfile.id,
        vaccineId: `custom-${Date.now()}`,
        vaccineName: newVaccineName.trim(),
        applicationDate: newVaccineDate || new Date().toISOString().split('T')[0],
        lot: newVaccineLot.trim() || undefined,
        healthUnit: newVaccineHealthUnit.trim() || undefined,
        notes: newVaccineNotes.trim() || undefined,
        status: 'applied',
      };
      await addVaccine(newVaccine);
    }

    await loadVaccines();

    // Limpar formulário
    setNewVaccineName('');
    setNewVaccineDate('');
    setNewVaccineLot('');
    setNewVaccineHealthUnit('');
    setNewVaccineNotes('');
    setEditingVaccine(null);
    setIsAddVaccineModalOpen(false);
  };

  const openImagePreview = (uri?: string) => {
    if (!uri) return;
    setImagePreviewUri(uri);
    setIsImageModalOpen(true);
  };

  const openMandatoryVaccineModal = (vaccineId: string) => {
    const existingRecord = mandatoryVaccineRecords.find((r) => r.vaccineId === vaccineId);
    setEditingMandatoryVaccine({ vaccineId, record: existingRecord });
  
    if (existingRecord) {
      setMandatoryIsApplied(existingRecord.isApplied);
      setMandatoryDate(existingRecord.applicationDate || '');
      setMandatoryLot(existingRecord.lot || '');
      setMandatoryCode(existingRecord.code || '');
      setMandatoryProfName(existingRecord.professionalName || '');
      setMandatoryProfId(existingRecord.professionalId || '');
      if (existingRecord.applicationDate) {
        setMandatoryVaccineDate(parseDate(existingRecord.applicationDate));
      }
    } else {
      setMandatoryIsApplied(false);
      setMandatoryDate('');
      setMandatoryLot('');
      setMandatoryCode('');
      setMandatoryProfName('');
      setMandatoryProfId('');
      setMandatoryVaccineDate(new Date());
    }
  
    setIsMandatoryVaccineModalOpen(true);
  };

  const handleMandatoryDateChange = (event: any, date?: Date) => {
    setShowMandatoryDatePicker(Platform.OS === 'ios');
    if (date) {
      setMandatoryVaccineDate(date);
      const isoDate = date.toISOString().split('T')[0];
      setMandatoryDate(isoDate);
    }
  };

  const handleSaveMandatoryVaccine = async () => {
    if (!editingMandatoryVaccine) return;

    const record: MandatoryVaccineRecord = {
      id: editingMandatoryVaccine.record?.id || `mvr-${Date.now()}`,
      profileId: selectedProfile.id,
      vaccineId: editingMandatoryVaccine.vaccineId,
      isApplied: mandatoryIsApplied,
      applicationDate: mandatoryDate || undefined,
      lot: mandatoryLot.trim() || undefined,
      code: mandatoryCode.trim() || undefined,
      professionalName: mandatoryProfName.trim() || undefined,
      professionalId: mandatoryProfId.trim() || undefined,
    };

    await updateMandatoryVaccineRecord(record);
    await loadMandatoryVaccineRecords();

    // Limpar formulário
    setMandatoryIsApplied(false);
    setMandatoryDate('');
    setMandatoryLot('');
    setMandatoryCode('');
    setMandatoryProfName('');
    setMandatoryProfId('');
    setEditingMandatoryVaccine(null);
    setIsMandatoryVaccineModalOpen(false);
  };

  // Outras Vacinas handlers
  const openOtherVaccineModal = (vaccine?: OtherVaccine) => {
    if (vaccine) {
      setEditingOtherVaccine(vaccine);
      setOtherVaccineName(vaccine.vaccineName);
      setOtherVaccineAppDate(vaccine.applicationDate || '');
      setOtherVaccineLot(vaccine.lot || '');
      setOtherVaccineCode(vaccine.code || '');
      setOtherVaccineProfName(vaccine.professionalName || '');
      setOtherVaccineProfId(vaccine.professionalId || '');
      if (vaccine.applicationDate) {
        setOtherVaccineDate(parseDate(vaccine.applicationDate));
      }
    } else {
      setEditingOtherVaccine(null);
      setOtherVaccineName('');
      setOtherVaccineAppDate('');
      setOtherVaccineLot('');
      setOtherVaccineCode('');
      setOtherVaccineProfName('');
      setOtherVaccineProfId('');
      setOtherVaccineDate(new Date());
    }
    setIsOtherVaccineModalOpen(true);
  };

  const handleOtherVaccineDateChange = (event: any, date?: Date) => {
    setShowOtherVaccineDatePicker(Platform.OS === 'ios');
    if (date) {
      setOtherVaccineDate(date);
      const isoDate = date.toISOString().split('T')[0];
      setOtherVaccineAppDate(isoDate);
    }
  };

  const handleSaveOtherVaccine = async () => {
    if (!otherVaccineName.trim()) return;

    const vaccine: OtherVaccine = {
      id: editingOtherVaccine?.id || `ov-${Date.now()}`,
      profileId: selectedProfile.id,
      vaccineName: otherVaccineName.trim(),
      applicationDate: otherVaccineAppDate || undefined,
      lot: otherVaccineLot.trim() || undefined,
      code: otherVaccineCode.trim() || undefined,
      professionalName: otherVaccineProfName.trim() || undefined,
      professionalId: otherVaccineProfId.trim() || undefined,
    };

    if (editingOtherVaccine) {
      await updateOtherVaccine(vaccine);
    } else {
      await addOtherVaccine(vaccine);
    }

    await loadOtherVaccines();

    // Limpar formulário
    setOtherVaccineName('');
    setOtherVaccineAppDate('');
    setOtherVaccineLot('');
    setOtherVaccineCode('');
    setOtherVaccineProfName('');
    setOtherVaccineProfId('');
    setEditingOtherVaccine(null);
    setIsOtherVaccineModalOpen(false);
  };

  const handleDeleteOtherVaccine = async (vaccineId: string) => {
    await deleteOtherVaccine(vaccineId);
    await loadOtherVaccines();
  };

  // Campanhas handlers
  const openCampaignModal = (campaign?: ParticipatingCampaign) => {
    setShowCampaignPicker(false); // sempre fecha o select ao abrir
    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignName(campaign.campaignName);
      setCampaignParticipationDate(campaign.participationDate);
      setCampaignDate(parseDate(campaign.participationDate));
    } else {
      setEditingCampaign(null);
      setCampaignName('');
      setCampaignParticipationDate('');
      setCampaignDate(new Date());
    }
    setIsCampaignModalOpen(true);
  };

  const handleCampaignDateChange = (event: any, date?: Date) => {
    setShowCampaignDatePicker(Platform.OS === 'ios');
    if (date) {
      setCampaignDate(date);
      const isoDate = date.toISOString().split('T')[0];
      setCampaignParticipationDate(isoDate);
    }
  };

  const handleSaveCampaign = async () => {
    if (!campaignName.trim() || !campaignParticipationDate) return;

    const campaign: ParticipatingCampaign = {
      id: editingCampaign?.id || `cmp-${Date.now()}`,
      profileId: selectedProfile.id,
      campaignName: campaignName.trim(),
      participationDate: campaignParticipationDate,
    };


    if (editingCampaign) {
      await updateCampaign(campaign);
    } else {
      // Integração com backend: ParticipacaoCampanha
      const campanhaSelecionada = availableCampaigns.find(c => c.nome === campaignName);
      if (!campanhaSelecionada) {
        Alert.alert('Erro', 'Selecione uma campanha válida.');
        return;
      }
      try {
        await addParticipacaoCampanha({
          idPessoa: Number(selectedProfile.id),
          idCampanha: campanhaSelecionada.id,
          dataParticipacao: campaignParticipationDate,
        });
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível registrar a participação na campanha.');
        return;
      }
    }

    await loadCampaigns();

    // Limpar formulário
    setCampaignName('');
    setCampaignParticipationDate('');
    setEditingCampaign(null);
    setIsCampaignModalOpen(false);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    await deleteCampaign(campaignId);
    await loadCampaigns();
  };

  const selectedApplications = useMemo(
    () => vaccines.filter((item) => item.profileId === selectedProfile.id),
    [vaccines, selectedProfile.id]
  );

  const pendingVaccines = selectedApplications.filter((item) => item.status === 'pending');
  const appliedVaccines = selectedApplications.filter((item) => item.status === 'applied');
  const nextVaccine = pendingVaccines.find((item) => item.dueDate);
  const activeAlerts = ALERTS_BY_PROFILE[selectedProfile.id] ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../assets/images/locvaclogo-trim.png')}
            resizeMode="contain"
            style={styles.logoIcon}
          />
          <View>
            <Text style={styles.title}>
              <Text style={styles.titleLoc}>Loc</Text>
              <Text style={styles.titleVac}>Vac</Text>
            </Text>
            <Text style={styles.subtitle}>Carteira Digital Familiar</Text>
          </View>
        </View>
        <View style={styles.profileSwitcher}>
          {selectedProfile.photoUri ? (
            <Pressable
              style={styles.profileBadge}
              onPress={() => openImagePreview(selectedProfile.photoUri)}
            >
              <Image source={{ uri: selectedProfile.photoUri }} style={styles.profileBadgeImage} />
            </Pressable>
          ) : (
            <Pressable
              style={styles.profileBadge}
              onPress={() => setIsProfileModalOpen(true)}
            >
              <Text style={styles.profileBadgeText}>{selectedProfile.name.charAt(0)}</Text>
            </Pressable>
          )}
          <Pressable onPress={() => setIsProfileModalOpen(true)}>
            <Ionicons name="chevron-down" size={16} color="#29442dff" />
          </Pressable>
        </View>
      </View>

      {!isLoading ? (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Carteira de Vacinação */}
          <View style={styles.vaccinationCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="medical" size={24} color="#005570" />
                <View>
                  <Text style={styles.cardTitle}>Carteira de Vacinação</Text>
                  <Text style={styles.cardSubtitle}>Digital</Text>
                </View>
              </View>
              {selectedProfile.photoUri ? (
                <Pressable
                  style={styles.cardProfileBadge}
                  onPress={() => openImagePreview(selectedProfile.photoUri)}
                >
                  <Image source={{ uri: selectedProfile.photoUri }} style={styles.cardProfileImage} />
                </Pressable>
              ) : (
                <View style={styles.cardProfileBadge}>
                  <Text style={styles.cardProfileText}>{selectedProfile.name.charAt(0)}</Text>
                </View>
              )}
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardBody}>
              {/* Nome conforme tipo de perfil */}
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoLabel}>
                  {selectedProfile.kind === 'dependent' ? 'Nome da Criança' : 'Nome'}
                </Text>
                <Text style={styles.cardInfoValue}>{selectedProfile.name}</Text>
              </View>

              {/* Nome do responsável apenas para dependentes */}
              {selectedProfile.kind === 'dependent' && selectedProfile.guardianName && (
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardInfoLabel}>Nome da Mãe ou Responsável</Text>
                  <Text style={styles.cardInfoValue}>{selectedProfile.guardianName}</Text>
                </View>
              )}

              {/* Local de nascimento */}
              {selectedProfile.birthPlace && (
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardInfoLabel}>Local de Nascimento</Text>
                  <Text style={styles.cardInfoValue}>{selectedProfile.birthPlace}</Text>
                </View>
              )}

              {/* Data de nascimento */}
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoLabel}>Data de Nascimento</Text>
                <Text style={styles.cardInfoValue}>{formatDateToBR(selectedProfile.birthDate)}</Text>
              </View>

              {/* Endereço */}
              {selectedProfile.address && (
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardInfoLabel}>Endereço</Text>
                  <Text style={styles.cardInfoValue}>{selectedProfile.address}</Text>
                </View>
              )}

              {/* Município/Estado */}
              {(selectedProfile.city || selectedProfile.state) && (
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardInfoLabel}>Município/Estado</Text>
                  <Text style={styles.cardInfoValue}>
                    {selectedProfile.city && selectedProfile.state
                      ? `${selectedProfile.city} - ${selectedProfile.state}`
                      : selectedProfile.city || selectedProfile.state}
                  </Text>
                </View>
              )}

              {/* CEP */}
              {selectedProfile.zipCode && (
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardInfoLabel}>CEP</Text>
                  <Text style={styles.cardInfoValue}>{selectedProfile.zipCode}</Text>
                </View>
              )}

              {/* Telefone */}
              {selectedProfile.phone && (
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardInfoLabel}>Telefone</Text>
                  <Text style={styles.cardInfoValue}>{selectedProfile.phone}</Text>
                </View>
              )}
            </View>

            <View style={styles.cardDivider} />
            
            {/* Botão removido */}
          </View>

          {/* Seção de Vacinas Obrigatórias do 1º Ano */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>VACINAS DO 1° ANO DE VIDA</Text>
            <View style={styles.mandatoryVaccinesContainer}>
              {(() => {
                let canShow = true;
                let lastAvailableIdx = -1;
                // Descobre o último item não aplicado
                for (let i = 0; i < MANDATORY_FIRST_YEAR_VACCINES.length; i++) {
                  const v = MANDATORY_FIRST_YEAR_VACCINES[i];
                  const rec = mandatoryVaccineRecords.find((r) => r.vaccineId === v.id);
                  if (!rec?.isApplied && lastAvailableIdx === -1) {
                    lastAvailableIdx = i;
                    break;
                  }
                }
                return MANDATORY_FIRST_YEAR_VACCINES.map((vaccine, idx) => {
                  const record = mandatoryVaccineRecords.find((r) => r.vaccineId === vaccine.id);
                  // Só mostra se pode ou se já foi aplicada
                  if (!canShow && !record?.isApplied) return null;
                  const isLastAvailable = idx === lastAvailableIdx;
                  const element = (
                    <Pressable
                      key={vaccine.id}
                      style={styles.mandatoryVaccineItem}
                      onPress={() => isLastAvailable ? openMandatoryVaccineModal(vaccine.id) : undefined}
                      disabled={!isLastAvailable}
                    >
                      <View style={styles.mandatoryVaccineHeader}>
                        <View style={styles.mandatoryVaccineInfo}>
                          <View style={styles.mandatoryVaccineTexts}>
                            <Text style={styles.mandatoryVaccineName}>{vaccine.name}</Text>
                            <Text style={styles.mandatoryVaccineDesc}>{vaccine.description}</Text>
                          </View>
                        </View>
                        <View style={styles.mandatoryVaccineStatus}>
                          {record?.isApplied ? (
                            <Ionicons name="checkmark-circle" size={24} color="#09BEA5" />
                          ) : (
                            <Ionicons name="ellipse-outline" size={24} color="#9CA3AF" />
                          )}
                        </View>
                      </View>
                      {record?.isApplied && (
                        <View style={styles.mandatoryVaccineDetails}>
                          {record.applicationDate && (
                            <Text style={styles.mandatoryVaccineDetail}>
                              <Text style={styles.mandatoryVaccineDetailLabel}>Data: </Text>
                              {formatDateToBR(record.applicationDate)}
                            </Text>
                          )}
                          {record.lot && (
                            <Text style={styles.mandatoryVaccineDetail}>
                              <Text style={styles.mandatoryVaccineDetailLabel}>Lote: </Text>
                              {record.lot}
                            </Text>
                          )}
                          {record.professionalName && (
                            <Text style={styles.mandatoryVaccineDetail}>
                              <Text style={styles.mandatoryVaccineDetailLabel}>Profissional: </Text>
                              {record.professionalName}
                            </Text>
                          )}
                        </View>
                      )}
                    </Pressable>
                  );
                  // Se não foi aplicada, bloqueia as próximas
                  if (!record?.isApplied) canShow = false;
                  return element;
                });
              })()}
            </View>
          </View>

          {/* Seção de Outras Vacinas */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>OUTRAS VACINAS</Text>
              <Pressable
                style={styles.addButton}
                onPress={() => openOtherVaccineModal()}
              >
                <Ionicons name="add-circle" size={24} color="#09BEA5" />
              </Pressable>
            </View>
            {otherVaccines.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma vacina adicional registrada.</Text>
            ) : (
              <View style={styles.mandatoryVaccinesContainer}>
                {otherVaccines.map((vaccine) => (
                  <Pressable
                    key={vaccine.id}
                    style={styles.mandatoryVaccineItem}
                    onPress={() => openOtherVaccineModal(vaccine)}
                  >
                    <View style={styles.mandatoryVaccineHeader}>
                      <View style={styles.mandatoryVaccineInfo}>
                        <View style={styles.mandatoryVaccineTexts}>
                          <Text style={styles.mandatoryVaccineName}>{vaccine.vaccineName}</Text>
                          {vaccine.applicationDate && (
                            <Text style={styles.mandatoryVaccineDesc}>
                              Aplicada em {formatDateToBR(vaccine.applicationDate)}
                            </Text>
                          )}
                        </View>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteOtherVaccine(vaccine.id)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </Pressable>
                    </View>
                    {vaccine.applicationDate && (
                      <View style={styles.mandatoryVaccineDetails}>
                        {vaccine.lot && (
                          <Text style={styles.mandatoryVaccineDetail}>
                            <Text style={styles.mandatoryVaccineDetailLabel}>Lote: </Text>
                            {vaccine.lot}
                          </Text>
                        )}
                        {vaccine.code && (
                          <Text style={styles.mandatoryVaccineDetail}>
                            <Text style={styles.mandatoryVaccineDetailLabel}>Código: </Text>
                            {vaccine.code}
                          </Text>
                        )}
                        {vaccine.professionalName && (
                          <Text style={styles.mandatoryVaccineDetail}>
                            <Text style={styles.mandatoryVaccineDetailLabel}>Profissional: </Text>
                            {vaccine.professionalName}
                            {vaccine.professionalId && ` (${vaccine.professionalId})`}
                          </Text>
                        )}
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Seção de Campanhas */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>CAMPANHAS</Text>
              <Pressable
                style={styles.addButton}
                onPress={() => openCampaignModal()}
              >
                <Ionicons name="add-circle" size={24} color="#09BEA5" />
              </Pressable>
            </View>
            {campaigns.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma campanha registrada.</Text>
            ) : (
              <View style={styles.mandatoryVaccinesContainer}>
                {campaigns.map((campaign) => (
                  <Pressable
                    key={campaign.id}
                    style={styles.mandatoryVaccineItem}
                    onPress={() => openCampaignModal(campaign)}
                  >
                    <View style={styles.mandatoryVaccineHeader}>
                      <View style={styles.mandatoryVaccineInfo}>
                        <View style={styles.mandatoryVaccineTexts}>
                          <Text style={styles.mandatoryVaccineName}>{campaign.campaignName}</Text>
                          <Text style={styles.mandatoryVaccineDesc}>
                            Participação em {formatDateToBR(campaign.participationDate)}
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteCampaign(campaign.id)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
      </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}

      <Modal
        visible={isProfileModalOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setIsProfileModalOpen(false)}
      >
        <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.5)" translucent />
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsProfileModalOpen(false)} />
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar perfil</Text>
              <Pressable onPress={() => setIsProfileModalOpen(false)}>
                <Ionicons name="close" size={18} color="#29442dff" />
              </Pressable>
            </View>
            {familyMembers.map((profile) => {
              const isSelected = profile.id === selectedProfileId;
              return (
                <Pressable
                  key={profile.id}
                  style={[styles.modalOption, isSelected && styles.modalOptionActive]}
                  onPress={() => {
                    setSelectedProfileId(profile.id);
                    setIsProfileModalOpen(false);
                  }}
                >
                  <View style={styles.modalOptionBadge}>
                    {profile.photoUri ? (
                      <Image source={{ uri: profile.photoUri }} style={styles.modalOptionBadgeImage} />
                    ) : (
                      <Text style={styles.modalOptionBadgeText}>{profile.name.charAt(0)}</Text>
                    )}
                  </View>
                  <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextActive]}>
                    {profile.kind === 'user' ? 'Você' : profile.name}
                  </Text>
                </Pressable>
              );
            })}
          </Pressable>
        </View>
      </Modal>

      <Modal
        visible={isMandatoryVaccineModalOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setIsMandatoryVaccineModalOpen(false)}
      >
        <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.5)" translucent />
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsMandatoryVaccineModalOpen(false)} />
          <View style={styles.addVaccineModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMandatoryVaccine && 
                  MANDATORY_FIRST_YEAR_VACCINES.find((v) => v.id === editingMandatoryVaccine.vaccineId)?.name
                }
              </Text>
              <Pressable onPress={() => setIsMandatoryVaccineModalOpen(false)}>
                <Ionicons name="close" size={18} color="#29442dff" />
              </Pressable>
            </View>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formField}>
                <View style={styles.checkboxField}>
                  <Pressable
                    style={styles.checkbox}
                    onPress={() => setMandatoryIsApplied(!mandatoryIsApplied)}
                  >
                    {mandatoryIsApplied && (
                      <Ionicons name="checkmark" size={16} color="#09BEA5" />
                    )}
                  </Pressable>
                  <Text style={styles.checkboxLabel}>Vacina aplicada</Text>
                </View>
              </View>

              {mandatoryIsApplied && (
                <>
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>Data de Aplicação</Text>
                    <Pressable
                      style={styles.datePickerButton}
                      onPress={() => setShowMandatoryDatePicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={18} color="#1f3322" />
                      <Text style={styles.datePickerText}>
                        {mandatoryDate ? formatDateToBR(mandatoryDate) : 'Selecione a data'}
                      </Text>
                    </Pressable>
                    {showMandatoryDatePicker && (
                      <DateTimePicker
                        value={mandatoryVaccineDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleMandatoryDateChange}
                        maximumDate={new Date()}
                        locale="pt-BR"
                      />
                    )}
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>Lote</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Número do lote"
                      placeholderTextColor="#9CA3AF"
                      value={mandatoryLot}
                      onChangeText={setMandatoryLot}
                    />
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>Código</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Código"
                      placeholderTextColor="#9CA3AF"
                      value={mandatoryCode}
                      onChangeText={setMandatoryCode}
                    />
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>Nome do Profissional</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Nome completo"
                      placeholderTextColor="#9CA3AF"
                      value={mandatoryProfName}
                      onChangeText={setMandatoryProfName}
                    />
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>RG do Profissional</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="RG"
                      placeholderTextColor="#9CA3AF"
                      value={mandatoryProfId}
                      onChangeText={setMandatoryProfId}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.formActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsMandatoryVaccineModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSaveMandatoryVaccine}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Outras Vacinas */}
      <Modal
        visible={isOtherVaccineModalOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setIsOtherVaccineModalOpen(false)}
      >
        <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.5)" translucent />
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsOtherVaccineModalOpen(false)} />
          <View style={styles.addVaccineModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingOtherVaccine ? 'Editar Vacina' : 'Adicionar Vacina'}
              </Text>
              <Pressable onPress={() => setIsOtherVaccineModalOpen(false)}>
                <Ionicons name="close" size={18} color="#29442dff" />
              </Pressable>
            </View>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Nome da Vacina *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: Vacina da Gripe"
                  placeholderTextColor="#9CA3AF"
                  value={otherVaccineName}
                  onChangeText={setOtherVaccineName}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Data de Aplicação</Text>
                <Pressable
                  style={styles.datePickerButton}
                  onPress={() => setShowOtherVaccineDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={18} color="#1f3322" />
                  <Text style={styles.datePickerText}>
                    {otherVaccineAppDate ? formatDateToBR(otherVaccineAppDate) : 'Selecione a data'}
                  </Text>
                </Pressable>
                {showOtherVaccineDatePicker && (
                  <DateTimePicker
                    value={otherVaccineDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleOtherVaccineDateChange}
                    maximumDate={new Date()}
                    locale="pt-BR"
                  />
                )}
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Lote</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Número do lote"
                  placeholderTextColor="#9CA3AF"
                  value={otherVaccineLot}
                  onChangeText={setOtherVaccineLot}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Código</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Código"
                  placeholderTextColor="#9CA3AF"
                  value={otherVaccineCode}
                  onChangeText={setOtherVaccineCode}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Nome do Profissional</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Nome completo"
                  placeholderTextColor="#9CA3AF"
                  value={otherVaccineProfName}
                  onChangeText={setOtherVaccineProfName}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>RG do Profissional</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="RG"
                  placeholderTextColor="#9CA3AF"
                  value={otherVaccineProfId}
                  onChangeText={setOtherVaccineProfId}
                />
              </View>
            </ScrollView>

            <View style={styles.formActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsOtherVaccineModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSaveOtherVaccine}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Campanhas */}
      <Modal
        visible={isCampaignModalOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setIsCampaignModalOpen(false)}
      >
        <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.5)" translucent />
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsCampaignModalOpen(false)} />
          <View style={styles.addVaccineModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCampaign ? 'Editar Campanha' : 'Adicionar Campanha'}
              </Text>
              <Pressable onPress={() => setIsCampaignModalOpen(false)}>
                <Ionicons name="close" size={18} color="#29442dff" />
              </Pressable>
            </View>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Nome da Campanha *</Text>
                <Pressable
                  style={styles.datePickerButton}
                  onPress={() => setShowCampaignPicker((prev) => !prev)}
                >
                  <Text style={campaignName ? styles.datePickerText : [styles.datePickerText, { color: '#9CA3AF' }] }>
                    {campaignName || 'Selecione uma campanha'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#1f3322" />
                </Pressable>
                {showCampaignPicker && (
                  <View style={styles.pickerDropdown}>
                    <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                      {availableCampaigns.map((c) => (
                        <Pressable
                          key={c.id}
                          style={[styles.pickerOption, campaignName === c.nome && styles.pickerOptionActive]}
                          onPress={() => {
                            setCampaignName(c.nome);
                            setShowCampaignPicker(false);
                          }}
                        >
                          <Text style={[styles.pickerOptionText, campaignName === c.nome && styles.pickerOptionTextActive]}>
                            {c.nome} {c.ativa ? '' : '(Inativa)'}
                          </Text>
                          {campaignName === c.nome && (
                            <Ionicons name="checkmark" size={18} color="#29442dff" />
                          )}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Data de Participação *</Text>
                <Pressable
                  style={styles.datePickerButton}
                  onPress={() => setShowCampaignDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={18} color="#1f3322" />
                  <Text style={styles.datePickerText}>
                    {campaignParticipationDate ? formatDateToBR(campaignParticipationDate) : 'Selecione a data'}
                  </Text>
                </Pressable>
                {showCampaignDatePicker && (
                  <DateTimePicker
                    value={campaignDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleCampaignDateChange}
                    maximumDate={new Date()}
                    locale="pt-BR"
                  />
                )}
              </View>
            </ScrollView>

            <View style={styles.formActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsCampaignModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSaveCampaign}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isAddVaccineModalOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setIsAddVaccineModalOpen(false)}
      >
        <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.5)" translucent />
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsAddVaccineModalOpen(false)} />
          <View style={styles.addVaccineModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingVaccine ? 'Editar Vacina' : 'Registrar Vacina'}
              </Text>
              <Pressable onPress={() => setIsAddVaccineModalOpen(false)}>
                <Ionicons name="close" size={18} color="#29442dff" />
              </Pressable>
            </View>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Nome da Vacina *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: Tríplice Viral, BCG, etc."
                  placeholderTextColor="#9CA3AF"
                  value={newVaccineName}
                  onChangeText={setNewVaccineName}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Data de Aplicação</Text>
                <Pressable
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={18} color="#1f3322" />
                  <Text style={styles.datePickerText}>
                    {newVaccineDate ? formatDateToBR(newVaccineDate) : 'Selecione a data'}
                  </Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    locale="pt-BR"
                  />
                )}
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Lote</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Número do lote"
                  placeholderTextColor="#9CA3AF"
                  value={newVaccineLot}
                  onChangeText={setNewVaccineLot}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Unidade de Saúde</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Nome da unidade de saúde"
                  placeholderTextColor="#9CA3AF"
                  value={newVaccineHealthUnit}
                  onChangeText={setNewVaccineHealthUnit}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Observações</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="Observações adicionais"
                  placeholderTextColor="#9CA3AF"
                  value={newVaccineNotes}
                  onChangeText={setNewVaccineNotes}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.formActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsAddVaccineModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleAddVaccine}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isImageModalOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setIsImageModalOpen(false)}
      >
        <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.75)" translucent />
        <View style={styles.imageModalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsImageModalOpen(false)} />
          <View style={styles.imageModalCard}>
            <Pressable
              style={styles.imageCloseButton}
              onPress={() => setIsImageModalOpen(false)}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </Pressable>
            {imagePreviewUri && (
              <Image
                source={{ uri: imagePreviewUri }}
                style={styles.imagePreview}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>

      <StatusBar style={isProfileModalOpen || isAddVaccineModalOpen || isImageModalOpen || isMandatoryVaccineModalOpen || isOtherVaccineModalOpen || isCampaignModalOpen ? 'light' : 'dark'} />
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
    paddingRight: 12,
    paddingLeft: 8,
    paddingTop: '10%',
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
  },
  titleLoc: {
    color: '#005570',
  },
  titleVac: {
    color: '#09BEA5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  logoIcon: {
    width: 48,
    height: 48,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#35573c',
  },
  profileSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#CAE3E2',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  profileBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#29442dff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  profileBadgeImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  profileSwitcherText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f3322',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 280,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    gap: 8,
    flexDirection: 'column',
  },
  imageModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 360,
    borderRadius: 12,
    backgroundColor: '#111',
  },
  imageCloseButton: {
    alignSelf: 'flex-end',
    padding: 6,
    marginBottom: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f3322',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F2F7F6',
  },
  modalOptionActive: {
    backgroundColor: '#29442dff',
  },
  modalOptionBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#CAE3E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f3322',
  },
  modalOptionBadgeImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f3322',
  },
  modalOptionTextActive: {
    color: '#fff',
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
    paddingTop: 12,
    paddingLeft: 4,
    fontWeight: '900',
    color: '#1f3322',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 8,
  },
  vaccinationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f3322',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#66776b',
    fontWeight: '500',
  },
  cardProfileBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CAE3E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#09BEA5',
  },
  cardProfileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  cardProfileText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f3322',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E8EEE8',
    marginVertical: 12,
  },
  cardBody: {
    gap: 10,
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfoLabel: {
    fontSize: 13,
    color: '#66776b',
    fontWeight: '500',
  },
  cardInfoValue: {
    fontSize: 14,
    color: '#1f3322',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 4,
  },
  cardStat: {
    alignItems: 'center',
    flex: 1,
  },
  cardStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#005570',
  },
  cardStatLabel: {
    fontSize: 11,
    color: '#66776b',
    marginTop: 2,
    fontWeight: '500',
  },
  cardStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E8EEE8',
  },
  cardNextVaccine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0FAF8',
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  cardNextVaccineInfo: {
    flex: 1,
  },
  cardNextVaccineLabel: {
    fontSize: 11,
    color: '#66776b',
    fontWeight: '500',
    marginBottom: 2,
  },
  cardNextVaccineValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f3322',
    marginBottom: 2,
  },
  cardNextVaccineDate: {
    fontSize: 12,
    color: '#09BEA5',
    fontWeight: '600',
  },
  addVaccineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#09BEA5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 4,
  },
  addVaccineButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  addVaccineModal: {
    width: '100%',
    maxWidth: 320,
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'column',
  },
  formScroll: {
    maxHeight: '100%',
    marginVertical: 8,
  },
  formField: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f3322',
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#F2F7F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f3322',
    borderWidth: 1,
    borderColor: '#E8EEE8',
  },
  datePickerButton: {
    backgroundColor: '#F2F7F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E8EEE8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePickerText: {
    fontSize: 14,
    color: '#1f3322',
    flex: 1,
  },
  formTextArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E8EEE8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f3322',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#09BEA5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  sectionBlock: {
    marginTop: 14,
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  historyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  historyItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f3322',
    flex: 1,
  },
  historyItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  historyActionButton: {
    padding: 4,
  },
  historyItemDetails: {
    gap: 4,
    paddingLeft: 28,
  },
  historyItemDetail: {
    fontSize: 12,
    color: '#66776b',
  },
  historyItemDetailLabel: {
    fontWeight: '600',
    color: '#1f3322',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CAE3E2',
  },
  loadingText: {
    fontSize: 16,
    color: '#1f3322',
    fontWeight: '600',
  },
  mandatoryVaccinesContainer: {
    gap: 6,
  },
  mandatoryVaccineItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
    minHeight: 64,
    justifyContent: 'center',
  },
  mandatoryVaccineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mandatoryVaccineInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },

  mandatoryVaccineTexts: {
    flex: 1,
  },
  mandatoryVaccineName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f3322',
    marginBottom: 2,
  },
  mandatoryVaccineDesc: {
    fontSize: 12,
    color: '#66776b',
  },
  mandatoryVaccineStatus: {
    marginLeft: 8,
  },
  mandatoryVaccineDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8EEE8',
    gap: 4,
    paddingLeft: 0,
  },
  mandatoryVaccineDetail: {
    fontSize: 12,
    color: '#66776b',
  },
  mandatoryVaccineDetailLabel: {
    fontWeight: '600',
    color: '#1f3322',
  },
  checkboxField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#09BEA5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F7F6',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f3322',
  },
  pickerDropdown: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
    overflow: 'hidden',
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F7F6',
  },
  pickerOptionActive: {
    backgroundColor: '#E6F2F1',
  },
  pickerOptionText: {
    fontSize: 13,
    color: '#1f3322',
  },
  pickerOptionTextActive: {
    fontWeight: '600',
    color: '#29442dff',
  },
});