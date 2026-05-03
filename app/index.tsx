import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, ScrollView, Image, Modal, Platform, TextInput, Alert } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { router, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dependent, FamilyMember, MandatoryVaccineRecord, OtherVaccine, ParticipatingCampaign } from './types/vaccination';
import { fetchMandatoryVaccines, fetchDosesPorPessoa, registrarDose, atualizarDose, deletarDose, VacinaDTO, fetchOutrasVacinasPorPessoa, registrarOutraVacina, atualizarOutraVacina } from './service/mandatoryVaccineService';
import { fetchCampaigns, addParticipacaoCampanha, updateParticipacaoCampanha, fetchParticipacoesByPessoa, deleteParticipacaoCampanha } from './service/campaignService';
import { Campanha } from './types/vaccination';
import { useAppContext } from './context/AppContext';

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
  const { mainUser, dependents, usuarioId, refreshDependents } = useAppContext();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null);
  const [mandatoryVaccineList, setMandatoryVaccineList] = useState<VacinaDTO[]>([]);
  const [mandatoryVaccineRecords, setMandatoryVaccineRecords] = useState<MandatoryVaccineRecord[]>([]);
  const [isMandatoryVaccineModalOpen, setIsMandatoryVaccineModalOpen] = useState(false);
  const [editingMandatoryVaccine, setEditingMandatoryVaccine] = useState<{ vaccineId: string; record?: MandatoryVaccineRecord } | null>(null);
  const [showMandatoryDatePicker, setShowMandatoryDatePicker] = useState(false);
  const [mandatoryVaccineDate, setMandatoryVaccineDate] = useState(new Date());
  const [savingMandatoryVaccine, setSavingMandatoryVaccine] = useState(false);

  // Estados para o formulário de vacina obrigatória
  const [mandatoryIsApplied, setMandatoryIsApplied] = useState(false);
  const [mandatoryDate, setMandatoryDate] = useState('');
  const [mandatoryLot, setMandatoryLot] = useState('');
  const [mandatoryCode, setMandatoryCode] = useState('');
  const [mandatoryProfName, setMandatoryProfName] = useState('');
  const [mandatoryProfId, setMandatoryProfId] = useState('');

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
  const [savingOtherVaccine, setSavingOtherVaccine] = useState(false);

  // Estados para campanhas
  const [campaigns, setCampaigns] = useState<ParticipatingCampaign[]>([]);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campanha[]>([]);
  const [showCampaignPicker, setShowCampaignPicker] = useState(false);
  useEffect(() => {
    fetchCampaigns()
      .then(setAvailableCampaigns)
      .catch(() => setAvailableCampaigns([]));
  }, []);

  useEffect(() => {
    fetchMandatoryVaccines()
      .then(setMandatoryVaccineList)
      .catch(() => setMandatoryVaccineList([]));
  }, []);

  useEffect(() => {
    if (mainUser && !selectedProfileId) {
      setSelectedProfileId(mainUser.id);
    }
  }, [mainUser]);

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<ParticipatingCampaign | null>(null);
  const [showCampaignDatePicker, setShowCampaignDatePicker] = useState(false);
  const [campaignDate, setCampaignDate] = useState(new Date());
  const [campaignName, setCampaignName] = useState('');
  const [campaignParticipationDate, setCampaignParticipationDate] = useState('');
  const [savingCampaign, setSavingCampaign] = useState(false);

  const loadMandatoryVaccineRecords = useCallback(async () => {
    if (!selectedProfileId) return;
    try {
      const [vaccines, doses] = await Promise.all([
        mandatoryVaccineList.length > 0 ? Promise.resolve(mandatoryVaccineList) : fetchMandatoryVaccines(),
        fetchDosesPorPessoa(Number(selectedProfileId)),
      ]);
      if (mandatoryVaccineList.length === 0) setMandatoryVaccineList(vaccines);
      const records: MandatoryVaccineRecord[] = doses.map((d) => ({
        id: String(d.id),
        profileId: String(d.idPessoa),
        vaccineId: String(d.idVacina),
        isApplied: true,
        applicationDate: d.dataAplicacao,
        lot: d.lote ?? undefined,
        code: d.observacao ?? undefined,
        professionalName: d.nomeProfissional ?? undefined,
        professionalId: d.registroProfissional ?? undefined,
      }));
      setMandatoryVaccineRecords(records);
    } catch (e) {
      setMandatoryVaccineRecords([]);
    }
  }, [selectedProfileId, mandatoryVaccineList]);

  const loadOtherVaccines = useCallback(async () => {
    if (!selectedProfileId) return;
    try {
      const doses = await fetchOutrasVacinasPorPessoa(Number(selectedProfileId));
      setOtherVaccines(doses.map((d) => ({
        id: String(d.id),
        profileId: String(d.idPessoa),
        vaccineName: d.nomeVacina,
        applicationDate: d.dataAplicacao ?? undefined,
        lot: d.lote ?? undefined,
        code: d.observacao ?? undefined,
        professionalName: d.nomeProfissional ?? undefined,
        professionalId: d.registroProfissional ?? undefined,
      })));
    } catch {
      setOtherVaccines([]);
    }
  }, [selectedProfileId]);


  const loadCampaigns = useCallback(async () => {
    if (!selectedProfileId) return;
    try {
      const participacoes = await fetchParticipacoesByPessoa(Number(selectedProfileId));
      const mapped = participacoes.map((p) => ({
        id: String(p.id),
        profileId: String(p.idPessoa),
        campaignName: p.nomeCampanha ?? `Campanha #${p.idCampanha}`,
        participationDate: p.dataParticipacao,
      }));
      setCampaigns(mapped);
    } catch {
      setCampaigns([]);
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
      loadMandatoryVaccineRecords();
      loadOtherVaccines();
      loadCampaigns();
    }, [loadMandatoryVaccineRecords, loadOtherVaccines, loadCampaigns])
  );

  const familyMembers = useMemo<FamilyMember[]>(() => {
    if (!mainUser) return [];
    return [mainUser, ...dependents];
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
    if (!editingMandatoryVaccine || savingMandatoryVaccine) return;

    const { vaccineId, record } = editingMandatoryVaccine;
    const payload = {
      idPessoa: Number(selectedProfile.id),
      idVacina: Number(vaccineId),
      dataAplicacao: mandatoryDate || new Date().toISOString().split('T')[0],
      lote: mandatoryLot.trim() || undefined,
      observacao: mandatoryCode.trim() || undefined,
      nomeProfissional: mandatoryProfName.trim() || undefined,
      registroProfissional: mandatoryProfId.trim() || undefined,
    };

    setSavingMandatoryVaccine(true);
    try {
      if (!mandatoryIsApplied && record?.id) {
        await deletarDose(Number(record.id));
      } else if (mandatoryIsApplied && record?.id) {
        await atualizarDose(Number(record.id), payload);
      } else if (mandatoryIsApplied) {
        await registrarDose(payload);
      }

      await loadMandatoryVaccineRecords();
      setMandatoryIsApplied(false);
      setMandatoryDate('');
      setMandatoryLot('');
      setMandatoryCode('');
      setMandatoryProfName('');
      setMandatoryProfId('');
      setEditingMandatoryVaccine(null);
      setIsMandatoryVaccineModalOpen(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a vacina.');
    } finally {
      setSavingMandatoryVaccine(false);
    }
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
    if (!otherVaccineName.trim() || savingOtherVaccine) return;

    const payload = {
      idPessoa: Number(selectedProfile.id),
      nomeVacina: otherVaccineName.trim(),
      dataAplicacao: otherVaccineAppDate || undefined,
      lote: otherVaccineLot.trim() || undefined,
      observacao: otherVaccineCode.trim() || undefined,
      nomeProfissional: otherVaccineProfName.trim() || undefined,
      registroProfissional: otherVaccineProfId.trim() || undefined,
    };

    setSavingOtherVaccine(true);
    try {
      if (editingOtherVaccine) {
        await atualizarOutraVacina(Number(editingOtherVaccine.id), payload);
      } else {
        await registrarOutraVacina(payload);
      }

      await loadOtherVaccines();
      setOtherVaccineName('');
      setOtherVaccineAppDate('');
      setOtherVaccineLot('');
      setOtherVaccineCode('');
      setOtherVaccineProfName('');
      setOtherVaccineProfId('');
      setEditingOtherVaccine(null);
      setIsOtherVaccineModalOpen(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a vacina.');
    } finally {
      setSavingOtherVaccine(false);
    }
  };

  const handleDeleteOtherVaccine = (vaccineId: string) => {
    Alert.alert(
      'Remover vacina',
      'Deseja remover este registro de vacina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarDose(Number(vaccineId));
              await loadOtherVaccines();
            } catch {
              Alert.alert('Erro', 'Não foi possível remover a vacina.');
            }
          },
        },
      ]
    );
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
    if (!campaignName.trim() || !campaignParticipationDate || savingCampaign) return;

    const campanhaSelecionada = availableCampaigns.find((c) => c.nome === campaignName);
    if (!campanhaSelecionada) {
      Alert.alert('Erro', 'Selecione uma campanha válida.');
      return;
    }
    setSavingCampaign(true);
    try {
      if (editingCampaign) {
        await updateParticipacaoCampanha({
          id: Number(editingCampaign.id),
          idPessoa: Number(selectedProfile.id),
          idCampanha: campanhaSelecionada.id,
          dataParticipacao: campaignParticipationDate,
        });
      } else {
        await addParticipacaoCampanha({
          idPessoa: Number(selectedProfile.id),
          idCampanha: campanhaSelecionada.id,
          dataParticipacao: campaignParticipationDate,
        });
      }

      await loadCampaigns();
      setCampaignName('');
      setCampaignParticipationDate('');
      setEditingCampaign(null);
      setIsCampaignModalOpen(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a participação na campanha.');
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    Alert.alert(
      'Remover campanha',
      'Deseja remover esta participação em campanha?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteParticipacaoCampanha(Number(campaignId));
              await loadCampaigns();
            } catch {
              Alert.alert('Erro', 'Não foi possível remover a participação.');
            }
          },
        },
      ]
    );
  };

  if (!mainUser) return null;

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
            vaccines={mandatoryVaccineList}
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
        vaccineName={mandatoryVaccineList.find(v => String(v.id) === editingMandatoryVaccine?.vaccineId)?.nome}
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
        saving={savingMandatoryVaccine}
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
        saving={savingOtherVaccine}
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
        saving={savingCampaign}
      />

      {/* Componente do Modal de Preview de Imagem */}
      <ImagePreviewModal
        visible={isImageModalOpen}
        imageUri={imagePreviewUri}
        onClose={() => setIsImageModalOpen(false)}
      />

      <StatusBar style={isProfileModalOpen || isImageModalOpen || isMandatoryVaccineModalOpen || isOtherVaccineModalOpen || isCampaignModalOpen ? 'light' : 'dark'} />
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