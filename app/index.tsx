import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, ScrollView, Image, Modal, Platform, TextInput, Alert } from 'react-native';
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import { router, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERTS_BY_PROFILE, MAIN_USER } from './data/family';
import { Dependent, FamilyMember, VaccineApplication, MandatoryVaccineRecord, OtherVaccine, ParticipatingCampaign } from './types/vaccination';
import { getDependents } from '../src/storage/dependents';
import { getVaccines, addVaccine, updateVaccine, deleteVaccine } from '../src/storage/vaccines';
import { getMandatoryVaccineRecordsByProfile, updateMandatoryVaccineRecord } from '../src/storage/mandatory-vaccines';
import { getOtherVaccinesByProfile, addOtherVaccine, updateOtherVaccine, deleteOtherVaccine } from '../src/storage/other-vaccines';
import { getCampaignsByProfile, addCampaign, updateCampaign, deleteCampaign } from '../src/storage/campaigns';
import { fetchCampaigns, addParticipacaoCampanha, fetchParticipacoesByPessoa } from './service/campaignService';
import { Campanha } from './types/vaccination';
import { getPessoaId, fetchPerfil } from './service/authService';

// Componentes
import Header from '../components/index_/Header';
import VaccinationCard from '../components/index_/VaccinationCard';
import MandatoryVaccinesSection from '../components/index_/MandatoryVaccinesSection';
import OtherVaccinesSection from '../components/index_/OtherVaccinesSection';
import CampaignsSection from '../components/index_/CampaignSection';
import ProfileModal from '../components/modals/ProfileModal';
import MandatoryVaccineModal from '../components/modals/MandatoryVaccineModal';
import OtherVaccineModal from '../components/modals/OtherVaccineModal';
import CampaignModal from '../components/modals/CampaignModal';
import ImagePreviewModal from '../components/modals/ImagePreviewModal';

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
  // Exibe tela de autenticação (login/cadastro) se não autenticado
  // O componente Login já gerencia o fluxo de autenticação/cadastro
  // e redireciona para a tela principal após login
  // return <Login />; // Removido para evitar código inalcançável
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
  const [mainUser, setMainUser] = useState<FamilyMember | null>(null);

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

    useEffect(() => {
      const loadProfile = async () => {
    try {
      const idPessoa = await getPessoaId();
      console.log('DEBUG idPessoa:', idPessoa);
      if (!idPessoa) {
        setIsLoading(false);
        return;
      }

      const perfil = await fetchPerfil(idPessoa);
      console.log('DEBUG perfil:', perfil);

      setMainUser({
        id: String(perfil.id),
        userId: String(perfil.id),
        name: perfil.nome,
        birthDate: perfil.dataNascimento,
        sex: perfil.sexoBiologico,
        kind: 'user',
        zipCode: perfil.cep,
        phone: perfil.telefone,
        // preencha os demais campos conforme PessoaResponseDTO
      });
      setSelectedProfileId(String(perfil.id));
      setIsLoading(false);
      } catch (error) {
        console.error('DEBUG Erro ao carregar perfil:', error);
        setIsLoading(false);
      }
    };

  loadProfile();
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


  // Carrega participações de campanha do backend
  const loadCampaigns = useCallback(async () => {
    if (selectedProfileId) {
      try {
        console.log('DEBUG loadCampaigns selectedProfileId:', selectedProfileId);
        const participacoes = await fetchParticipacoesByPessoa(Number(selectedProfileId));
        console.log('DEBUG loadCampaigns participacoes:', participacoes);
        // Mapeia para o formato ParticipatingCampaign esperado pelo frontend
        const mapped = participacoes.map((p: any) => ({
          id: String(p.id),
          profileId: String(p.idPessoa),
          campaignName: p.nomeCampanha,
          participationDate: p.dataParticipacao,
        }));
        console.log('DEBUG loadCampaigns mapped:', mapped);
        setCampaigns(mapped);
      } catch (e) {
        console.log('DEBUG loadCampaigns erro:', e);
        setCampaigns([]);
      }
    }
  }, [selectedProfileId]);

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

  const familyMembers = useMemo<FamilyMember[]>(() => {
  if (!mainUser) return [];
  return [
    mainUser,
    ...dependents.map((d) => ({ ...d, kind: 'dependent' as const })),
  ];
  }, [mainUser, dependents]);

  const selectedProfile = useMemo((): FamilyMember => {
    if (!mainUser) {
      // Fallback: always return a FamilyMember with a valid name
      return { id: 'unknown', userId: 'unknown', name: 'Usuário', birthDate: '', sex: 'Outro', kind: 'user' } as FamilyMember;
    }
    return familyMembers.find((p) => p.id === selectedProfileId) ?? mainUser;
  }, [familyMembers, selectedProfileId, mainUser]);

  useFocusEffect(
    useCallback(() => {
      if (mainUser && !familyMembers.some((p) => p.id === selectedProfileId)) {
        setSelectedProfileId(mainUser.id);
      }
    }, [familyMembers, selectedProfileId, mainUser])
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
    if (!editingMandatoryVaccine) {
      // Nunca deve acontecer, mas para o TS garantir, retorna cedo
      return;
    }

    const { vaccineId, record } = editingMandatoryVaccine;
    const newRecord: MandatoryVaccineRecord = {
      id: record?.id || `mvr-${Date.now()}`,
      profileId: selectedProfile.id,
      vaccineId,
      isApplied: mandatoryIsApplied,
      applicationDate: mandatoryDate || undefined,
      lot: mandatoryLot.trim() || undefined,
      code: mandatoryCode.trim() || undefined,
      professionalName: mandatoryProfName.trim() || undefined,
      professionalId: mandatoryProfId.trim() || undefined,
    };

    await updateMandatoryVaccineRecord(newRecord);
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

console.log('DEBUG mainUser:', mainUser, 'isLoading:', isLoading);

  // Guard antes do return principal — enquanto carrega, mostra só o loading
  if (isLoading || !mainUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  // Daqui pra baixo, selectedProfile sempre tem dados
  return (
    
    <View style={styles.container}>
      
      {/* Componente de construção do 
      Header com seleção de perfil e preview de imagem */}
      <Header
        selectedProfile={selectedProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenImagePreview={openImagePreview}
      />

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Componente da Carteira de Vacinação */}
          <VaccinationCard
            profile={selectedProfile}
            onOpenImagePreview={openImagePreview}
          />

          {/* Componente da seção de Vacinas 
          Obrigatórias do 1º Ano de Vida */}
          <MandatoryVaccinesSection
            records={mandatoryVaccineRecords}
            onOpenModal={openMandatoryVaccineModal}
          />


          {/* Componente da seção de Outras Vacinas */}
          <OtherVaccinesSection
            vaccines={otherVaccines}
            onOpenModal={openOtherVaccineModal}
            onDelete={handleDeleteOtherVaccine}
          />

          {/* Componente da seção de Campanhas */}
          <CampaignsSection
            campaigns={campaigns}
            onOpenModal={openCampaignModal}
            onDelete={handleDeleteCampaign}
          />
      </ScrollView> 

      {/* Componente doModal de seleção de perfil */}
      <ProfileModal
        visible={isProfileModalOpen}
        familyMembers={familyMembers}
        selectedProfileId={selectedProfileId}
        onSelectProfile={setSelectedProfileId}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Componente do Modal de Vacina Obrigatória 
      tem muitas props pois seu estado se mantém vivo na index.*/}
      <MandatoryVaccineModal
        visible={isMandatoryVaccineModalOpen}
        vaccineId={editingMandatoryVaccine?.vaccineId ?? null}
        isApplied={mandatoryIsApplied}
        date={mandatoryDate}
        lot={mandatoryLot}
        code={mandatoryCode}
        profName={mandatoryProfName}
        profId={mandatoryProfId}
        pickerDate={mandatoryVaccineDate}
        showDatePicker={showMandatoryDatePicker}
        onToggleApplied={() => setMandatoryIsApplied(!mandatoryIsApplied)}
        onShowDatePicker={() => setShowMandatoryDatePicker(true)}
        onDateChange={handleMandatoryDateChange}
        onChangeLot={setMandatoryLot}
        onChangeCode={setMandatoryCode}
        onChangeProfName={setMandatoryProfName}
        onChangeProfId={setMandatoryProfId}
        onSave={handleSaveMandatoryVaccine}
        onClose={() => setIsMandatoryVaccineModalOpen(false)}
      />

      {/* Componente do Modal de Outras Vacinas 
      tem muitas props pois seu estado se mantém vivo na index.*/}
      <OtherVaccineModal
        visible={isOtherVaccineModalOpen}
        isEditing={!!editingOtherVaccine}
        name={otherVaccineName}
        date={otherVaccineAppDate}
        lot={otherVaccineLot}
        code={otherVaccineCode}
        profName={otherVaccineProfName}
        profId={otherVaccineProfId}
        pickerDate={otherVaccineDate}
        showDatePicker={showOtherVaccineDatePicker}
        onChangeName={setOtherVaccineName}
        onShowDatePicker={() => setShowOtherVaccineDatePicker(true)}
        onDateChange={handleOtherVaccineDateChange}
        onChangeLot={setOtherVaccineLot}
        onChangeCode={setOtherVaccineCode}
        onChangeProfName={setOtherVaccineProfName}
        onChangeProfId={setOtherVaccineProfId}
        onSave={handleSaveOtherVaccine}
        onClose={() => setIsOtherVaccineModalOpen(false)}
      />

      {/* Componente do Modal de Campanhas 
      tem muitas props pois seu estado se mantém vivo na index.*/}
      <CampaignModal
        visible={isCampaignModalOpen}
        isEditing={!!editingCampaign}
        campaignName={campaignName}
        participationDate={campaignParticipationDate}
        pickerDate={campaignDate}
        showDatePicker={showCampaignDatePicker}
        showCampaignPicker={showCampaignPicker}
        availableCampaigns={availableCampaigns}
        onSelectCampaign={(name) => {
          setCampaignName(name);
          setShowCampaignPicker(false);
        }}
        onToggleCampaignPicker={() => setShowCampaignPicker((prev) => !prev)}
        onShowDatePicker={() => setShowCampaignDatePicker(true)}
        onDateChange={handleCampaignDateChange}
        onSave={handleSaveCampaign}
        onClose={() => setIsCampaignModalOpen(false)}
      />

      {/* Componente do Modal de Preview de Imagem */}
      <ImagePreviewModal
        visible={isImageModalOpen}
        imageUri={imagePreviewUri}
        onClose={() => setIsImageModalOpen(false)}
      />

      <StatusBar style={isProfileModalOpen || isAddVaccineModalOpen || isImageModalOpen || isMandatoryVaccineModalOpen || isOtherVaccineModalOpen || isCampaignModalOpen ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAE3E2',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 130,
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
});