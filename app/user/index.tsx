import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';

import * as ImagePicker from 'expo-image-picker';
import * as NavigationBar from 'expo-navigation-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FamilyMember } from '../../src/types/vaccination';
import { addDependentAndLink, updateDependent, deleteDependent } from '../../src/service/dependentsService';
import { updateTitular } from '../../src/service/authService';
import { useAppContext } from '../../src/context/AppContext';
import logger from '../../src/utils/logger';
import DependentInfoModal from '../../components/modals/DependentInfoModal';
import { radii, spacing, typography, shadows, Tone } from '../../src/theme/tokens';
import { Avatar, ScreenTitle } from '../../components/redesign';
import { makeStyles } from '../../src/styles/user';
import { useTheme } from '../../src/context/ThemeContext';

const SEX_OPTIONS = ['M', 'F'] as const;
const RELATIONSHIP_OPTIONS = ['Filho', 'Filha', 'Neto', 'Neta', 'Sobrinho', 'Sobrinha', 'Irmão', 'Irmã', 'Outro'];
const ESTADO_OPTIONS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'] as const;
type EstadoUF = typeof ESTADO_OPTIONS[number];

const DEPENDENT_TONES: Tone[] = ['brand', 'coral', 'ochre'];

type DraftDependent = {
  id?: string;
  name: string;
  birthDate: string;
  birthPlace?: string;
  relationship: string;
  guardianName?: string;
  sex: 'M' | 'F' | '';
  photoUri?: string;
  cns?: string;
  zipCode?: string;
  address?: string;
  complement?: string;
  city?: string;
  state?: EstadoUF | '';
  phone?: string;
};

type DraftTitular = {
  name: string;
  birthDate: string;
  sex: 'M' | 'F' | '';
  photoUri?: string;
  cns?: string;
  zipCode?: string;
  address?: string;
  complement?: string;
  city?: string;
  state?: EstadoUF | '';
  phone?: string;
};

export default function User() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { mainUser, dependents, usuarioId, refreshDependents, refreshMainUser } = useAppContext();

  // — dependent modal state —
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDependent, setSelectedDependent] = useState<FamilyMember | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);
  const [savingDependent, setSavingDependent] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [draft, setDraft] = useState<DraftDependent>({
    name: '', birthDate: '', birthPlace: '', relationship: '',
    guardianName: '', sex: '', photoUri: undefined,
    address: '', city: '', state: '', zipCode: '', phone: '',
  });
  type DepFieldKey = 'name' | 'birthDate' | 'relationship' | 'sex' | 'zipCode' | 'phone';
  const [errors, setErrors] = useState<Partial<Record<DepFieldKey, string>>>({});

  // — titular modal state —
  const [isTitularModalOpen, setIsTitularModalOpen] = useState(false);
  const [savingTitular, setSavingTitular] = useState(false);
  const [showTitularDatePicker, setShowTitularDatePicker] = useState(false);
  const [showTitularStatePicker, setShowTitularStatePicker] = useState(false);
  const [titularDraft, setTitularDraft] = useState<DraftTitular>({
    name: '', birthDate: '', sex: '', photoUri: undefined,
    cns: '', zipCode: '', address: '', complement: '', city: '', state: '', phone: '',
  });
  type TitularFieldKey = 'name' | 'birthDate' | 'sex' | 'zipCode' | 'phone';
  const [titularErrors, setTitularErrors] = useState<Partial<Record<TitularFieldKey, string>>>({});

  // — help modal state —
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const anyModalOpen = isModalOpen || isHelpModalOpen || isTitularModalOpen;

  useEffect(() => {
    const updateSystemBars = async () => {
      if (Platform.OS !== 'android') return;
      try {
        if (anyModalOpen) {
          await NavigationBar.setButtonStyleAsync('light');
          await NavigationBar.setVisibilityAsync('visible');
        } else {
          await NavigationBar.setButtonStyleAsync('dark');
        }
      } catch (error) {
        logger.warn('NavigationBar API não disponível no Expo Go');
      }
    };
    updateSystemBars();
  }, [anyModalOpen]);

  // — formatters —
  const formatDateToBR = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const formatCns = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 15);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 11) return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)} ${digits.slice(11)}`;
  };

  const lookupCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return null;
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`).catch(() => null);
    if (!response?.ok) return null;
    const data = await response.json().catch(() => null);
    return data?.erro ? null : data;
  };

  const fetchCep = async (cep: string) => {
    const data = await lookupCep(cep);
    if (!data) return;
    setDraft((c) => ({
      ...c,
      ...(data.logradouro && { address: data.logradouro }),
      ...(data.localidade && { city: data.localidade }),
      ...(data.uf && { state: data.uf as EstadoUF }),
    }));
  };

  const fetchTitularCep = async (cep: string) => {
    const data = await lookupCep(cep);
    if (!data) return;
    setTitularDraft((c) => ({
      ...c,
      ...(data.logradouro && { address: data.logradouro }),
      ...(data.localidade && { city: data.localidade }),
      ...(data.uf && { state: data.uf as EstadoUF }),
    }));
  };

  // — image pickers —
  const handlePickImage = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso para escolher a foto.');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.5, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5, base64: true });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const photoUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
      setDraft((c) => ({ ...c, photoUri }));
    }
  };

  const handlePickTitularImage = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso para escolher a foto.');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.5, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5, base64: true });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const photoUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
      setTitularDraft((c) => ({ ...c, photoUri }));
    }
  };

  // — dependent modal logic —
  const clearError = (field: DepFieldKey) =>
    setErrors((c) => { if (!c[field]) return c; const n = { ...c }; delete n[field]; return n; });

  const modalScrollRef = useRef<ScrollView>(null);
  const modalScrollY = useRef(0);
  const nameInputRef = useRef<TextInput>(null);
  const birthDateRef = useRef<View>(null);
  const relationshipRef = useRef<View>(null);
  const sexRef = useRef<View>(null);
  const zipCodeRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const DEP_FIELD_ORDER: DepFieldKey[] = ['name', 'birthDate', 'relationship', 'sex', 'zipCode', 'phone'];

  const scrollDepToFirstError = (currentErrors: Partial<Record<DepFieldKey, string>>) => {
    const firstField = DEP_FIELD_ORDER.find((f) => currentErrors[f]);
    if (!firstField) return;
    const refMap: Record<DepFieldKey, React.RefObject<any>> = {
      name: nameInputRef, birthDate: birthDateRef,
      relationship: relationshipRef, sex: sexRef,
      zipCode: zipCodeRef, phone: phoneRef,
    };
    const ref = refMap[firstField];
    const scroll = modalScrollRef.current;
    if (!ref?.current || !scroll) return;
    setTimeout(() => {
      try {
        (ref.current as any).measure?.(
          (_x: number, _y: number, _w: number, h: number, _pageX: number, pageY: number) => {
            const screenHeight = Dimensions.get('window').height;
            const delta = (pageY + h / 2) - screenHeight / 2;
            scroll.scrollTo({ y: Math.max(0, modalScrollY.current + delta), animated: true });
          },
        );
      } catch {}
    }, 80);
  };

  const validateDraft = () => {
    const e: Partial<Record<DepFieldKey, string>> = {};
    if (!draft.name.trim()) e.name = 'Campo obrigatório!';
    if (!draft.birthDate.trim()) e.birthDate = 'Campo obrigatório!';
    if (!draft.relationship.trim()) e.relationship = 'Campo obrigatório!';
    if (!draft.sex) e.sex = 'Campo obrigatório!';
    if (!draft.zipCode || draft.zipCode.replace(/\D/g, '').length !== 8) e.zipCode = 'Campo obrigatório!';
    if (!draft.phone?.trim()) e.phone = 'Campo obrigatório!';
    if (Object.keys(e).length > 0) { setErrors(e); scrollDepToFirstError(e); return false; }
    setErrors({});
    return true;
  };

  const resetDraft = () => {
    setDraft({ name: '', birthDate: '', birthPlace: '', relationship: '', guardianName: '', sex: '',
      photoUri: undefined, cns: '', zipCode: '', address: '', complement: '', city: '', state: '', phone: '' });
    setShowDatePicker(false);
    setShowRelationshipPicker(false);
    setShowStatePicker(false);
    setErrors({});
  };

  const openCreate = () => { resetDraft(); modalScrollY.current = 0; setIsModalOpen(true); };

  const openEdit = (dependent: FamilyMember) => {
    setDraft({
      id: dependent.id,
      name: dependent.name,
      birthDate: dependent.birthDate,
      birthPlace: dependent.birthPlace || '',
      relationship: dependent.relationship || '',
      guardianName: dependent.guardianName || '',
      sex: dependent.sex === 'M' || dependent.sex === 'F' ? dependent.sex : '',
      photoUri: dependent.photoUri,
      cns: dependent.cns ? formatCns(dependent.cns) : '',
      zipCode: dependent.zipCode ? formatCep(dependent.zipCode) : '',
      address: dependent.address || '',
      complement: dependent.complement || '',
      city: dependent.city || '',
      state: (dependent.state as EstadoUF) || '',
      phone: formatPhone(dependent.phone || ''),
    });
    setShowDatePicker(false);
    setShowRelationshipPicker(false);
    setErrors({});
    modalScrollY.current = 0;
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (savingDependent) return;
    if (!validateDraft() || !mainUser) return;
    setSavingDependent(true);
    try {
      const payload = {
        ...draft,
        sex: draft.sex as 'M' | 'F',
        cns: draft.cns?.replace(/\D/g, '') || undefined,
        zipCode: draft.zipCode?.replace(/\D/g, '') || undefined,
      };
      if (draft.id) {
        await updateDependent(draft.id, payload);
      } else {
        await addDependentAndLink(usuarioId!, payload);
      }
      setIsModalOpen(false);
      resetDraft();
      await refreshDependents();
    } catch (e: any) {
      Alert.alert('Erro', draft.id ? 'Não foi possível atualizar o dependente.' : 'Não foi possível adicionar o dependente.');
      logger.error('Erro ao salvar dependente:', e?.response?.status);
    } finally {
      setSavingDependent(false);
    }
  };

  const handleRemove = (dependent: FamilyMember) => {
    Alert.alert(
      'Remover dependente',
      `Deseja remover ${dependent.name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDependent(dependent.id);
              await refreshDependents();
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível remover o dependente.');
              logger.error('Erro ao remover dependente:', e);
            }
          },
        },
      ]
    );
  };

  // — titular modal logic —
  const clearTitularError = (field: TitularFieldKey) =>
    setTitularErrors((c) => { if (!c[field]) return c; const n = { ...c }; delete n[field]; return n; });

  const validateTitularDraft = () => {
    const e: Partial<Record<TitularFieldKey, string>> = {};
    if (!titularDraft.name.trim()) e.name = 'Campo obrigatório!';
    if (!titularDraft.birthDate.trim()) e.birthDate = 'Campo obrigatório!';
    if (!titularDraft.sex) e.sex = 'Campo obrigatório!';
    if (!titularDraft.zipCode || titularDraft.zipCode.replace(/\D/g, '').length !== 8) e.zipCode = 'Campo obrigatório!';
    if (!titularDraft.phone?.trim()) e.phone = 'Campo obrigatório!';
    if (Object.keys(e).length > 0) { setTitularErrors(e); return false; }
    setTitularErrors({});
    return true;
  };

  const openEditTitular = () => {
    if (!mainUser) return;
    setTitularDraft({
      name: mainUser.name,
      birthDate: mainUser.birthDate,
      sex: mainUser.sex === 'M' || mainUser.sex === 'F' ? mainUser.sex : '',
      photoUri: mainUser.photoUri,
      cns: mainUser.cns ? formatCns(mainUser.cns) : '',
      zipCode: mainUser.zipCode ? formatCep(mainUser.zipCode) : '',
      address: mainUser.address || '',
      complement: mainUser.complement || '',
      city: mainUser.city || '',
      state: (mainUser.state as EstadoUF) || '',
      phone: formatPhone(mainUser.phone || ''),
    });
    setTitularErrors({});
    setShowTitularDatePicker(false);
    setShowTitularStatePicker(false);
    setIsTitularModalOpen(true);
  };

  const handleSaveTitular = async () => {
    if (savingTitular || !mainUser) return;
    if (!validateTitularDraft()) return;
    setSavingTitular(true);
    try {
      await updateTitular(mainUser.id, {
        nome: titularDraft.name,
        dataNascimento: titularDraft.birthDate,
        sexoBiologico: titularDraft.sex === 'M' ? 'MASCULINO' : 'FEMININO',
        cns: titularDraft.cns?.replace(/\D/g, '') || undefined,
        cep: titularDraft.zipCode?.replace(/\D/g, '') || '',
        rua: titularDraft.address,
        complemento: titularDraft.complement,
        municipio: titularDraft.city,
        estado: titularDraft.state || undefined,
        telefone: (titularDraft.phone || '').replace(/\D/g, ''),
        fotoUrl: titularDraft.photoUri,
      });
      setIsTitularModalOpen(false);
      await refreshMainUser();
    } catch (e: any) {
      Alert.alert('Erro', 'Não foi possível atualizar seus dados.');
      logger.error('Erro ao salvar titular:', e?.response?.status);
    } finally {
      setSavingTitular(false);
    }
  };

  return (
    <View style={styles.container}>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {mainUser && (
          <View style={styles.profileCard}>
            <Avatar name={mainUser.name} size={72} tone="brand" active />
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{mainUser.name}</Text>
              <View style={styles.profileTagRow}>
                <View style={styles.profileTag}>
                  <Ionicons name="shield-checkmark" size={11} color={colors.brandInk} />
                  <Text style={styles.profileTagText}>Titular</Text>
                </View>
              </View>
              <Text style={styles.profileEmail} numberOfLines={1}>{mainUser.email}</Text>
            </View>
            <Pressable style={styles.iconButton} onPress={openEditTitular} hitSlop={8}>
              <Ionicons name="create-outline" size={18} color={colors.brand} />
            </Pressable>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Dependentes</Text>
              <Text style={styles.sectionSub}>{dependents.length} {dependents.length === 1 ? 'pessoa' : 'pessoas'} vinculadas</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={openCreate} activeOpacity={0.85}>
              <Ionicons name="add" size={16} color={colors.white} />
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {dependents.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons name="people-outline" size={22} color={colors.brand} />
              </View>
              <Text style={styles.emptyTitle}>Nenhum dependente</Text>
              <Text style={styles.emptySub}>Adicione filhos, idosos ou outros familiares para acompanhar a vacinação deles.</Text>
            </View>
          ) : (
            <View style={styles.dependentsList}>
              {dependents.map((dependent, idx) => {
                const tone: Tone = DEPENDENT_TONES[idx % DEPENDENT_TONES.length];
                return (
                  <View key={dependent.id} style={styles.dependentCard}>
                    <Pressable style={styles.dependentRow} onPress={() => setSelectedDependent(dependent)}>
                      <Avatar name={dependent.name} photoUri={dependent.photoUri} size={44} tone={tone} />
                      <View style={styles.dependentInfo}>
                        <Text style={styles.dependentName}>{dependent.name}</Text>
                        <Text style={styles.dependentMeta} numberOfLines={1}>
                          {dependent.relationship || dependent.kind} · {formatDateToBR(dependent.birthDate)} · {dependent.sex}
                        </Text>
                      </View>
                    </Pressable>
                    <View style={styles.dependentActions}>
                      <Pressable style={styles.iconButton} onPress={() => openEdit(dependent)}>
                        <Ionicons name="create-outline" size={18} color={colors.brand} />
                      </Pressable>
                      <Pressable style={styles.iconButton} onPress={() => handleRemove(dependent)}>
                        <Ionicons name="trash-outline" size={18} color={colors.coral} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push('/configuracoes')}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="settings-outline" size={18} color={colors.brand} />
              </View>
              <Text style={styles.menuLabel}>Configurações</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.ink4} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => setIsHelpModalOpen(true)}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="help-circle-outline" size={18} color={colors.brand} />
              </View>
              <Text style={styles.menuLabel}>Ajuda</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.ink4} />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* ——— Modal: editar titular ——— */}
      <Modal
        visible={isTitularModalOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setIsTitularModalOpen(false)}
      >
        <StatusBar style="light" backgroundColor={colors.dimDark} translucent />
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsTitularModalOpen(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Meus dados</Text>
              <Pressable style={styles.modalClose} onPress={() => setIsTitularModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={18} color={colors.ink2} />
              </Pressable>
            </View>
            <Text style={styles.legend}>
              Campos com <Text style={styles.required}>*</Text> são obrigatórios
            </Text>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* foto */}
              <View style={styles.photoRow}>
                {titularDraft.photoUri ? (
                  <Image source={{ uri: titularDraft.photoUri }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="person" size={24} color={colors.brand} />
                  </View>
                )}
                <View style={styles.photoActions}>
                  <Pressable style={styles.photoButton} onPress={() => handlePickTitularImage(false)}>
                    <Ionicons name="image-outline" size={14} color={colors.white} />
                    <Text style={styles.photoButtonText}>Galeria</Text>
                  </Pressable>
                  <Pressable style={styles.photoButton} onPress={() => handlePickTitularImage(true)}>
                    <Ionicons name="camera-outline" size={14} color={colors.white} />
                    <Text style={styles.photoButtonText}>Câmera</Text>
                  </Pressable>
                  {titularDraft.photoUri ? (
                    <Pressable style={[styles.photoButton, styles.photoButtonGhost]}
                      onPress={() => setTitularDraft((c) => ({ ...c, photoUri: undefined }))}>
                      <Text style={[styles.photoButtonText, styles.photoButtonTextGhost]}>Remover</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              {/* nome */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, titularErrors.name && styles.inputError]}
                  value={titularDraft.name}
                  onChangeText={(v) => { setTitularDraft((c) => ({ ...c, name: v })); clearTitularError('name'); }}
                  placeholder="Nome completo"
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                />
                {titularErrors.name && <Text style={styles.errorText}>{titularErrors.name}</Text>}
              </View>

              {/* nascimento */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nascimento <Text style={styles.required}>*</Text></Text>
                <Pressable
                  style={[styles.dateButton, titularErrors.birthDate && styles.inputError]}
                  onPress={() => setShowTitularDatePicker(true)}
                >
                  <Text style={titularDraft.birthDate ? styles.dateButtonTextFilled : styles.dateButtonText}>
                    {titularDraft.birthDate ? formatDateToBR(titularDraft.birthDate) : 'Selecionar data'}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={colors.brand} />
                </Pressable>
                {titularErrors.birthDate && <Text style={styles.errorText}>{titularErrors.birthDate}</Text>}
                {showTitularDatePicker && (
                  <DateTimePicker
                    value={titularDraft.birthDate ? new Date(titularDraft.birthDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_event: any, selectedDate?: Date) => {
                      setShowTitularDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        const dateStr = selectedDate.toISOString().split('T')[0];
                        setTitularDraft((c) => ({ ...c, birthDate: dateStr }));
                        clearTitularError('birthDate');
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              {/* sexo */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Sexo <Text style={styles.required}>*</Text></Text>
                <View style={styles.sexRow}>
                  {SEX_OPTIONS.map((option) => {
                    const isActive = titularDraft.sex === option;
                    return (
                      <Pressable
                        key={option}
                        style={[styles.sexChip, isActive && styles.sexChipActive, titularErrors.sex && !isActive && styles.inputError]}
                        onPress={() => { setTitularDraft((c) => ({ ...c, sex: option })); clearTitularError('sex'); }}
                      >
                        <Text style={[styles.sexChipText, isActive && styles.sexChipTextActive]}>{option}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {titularErrors.sex && <Text style={styles.errorText}>{titularErrors.sex}</Text>}
              </View>

              {/* CNS */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CNS</Text>
                <TextInput
                  style={styles.input}
                  value={titularDraft.cns}
                  onChangeText={(v) => setTitularDraft((c) => ({ ...c, cns: formatCns(v) }))}
                  placeholder="000 0000 0000 0000"
                  placeholderTextColor={colors.ink4}
                  keyboardType="numeric"
                  maxLength={18}
                />
              </View>

              {/* CEP */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CEP <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, titularErrors.zipCode && styles.inputError]}
                  value={titularDraft.zipCode}
                  onChangeText={(v) => { setTitularDraft((c) => ({ ...c, zipCode: formatCep(v) })); clearTitularError('zipCode'); }}
                  onBlur={() => fetchTitularCep(titularDraft.zipCode || '')}
                  placeholder="00000-000"
                  placeholderTextColor={colors.ink4}
                  keyboardType="numeric"
                  maxLength={9}
                />
                {titularErrors.zipCode && <Text style={styles.errorText}>{titularErrors.zipCode}</Text>}
              </View>

              {/* rua */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Rua</Text>
                <TextInput
                  style={styles.input}
                  value={titularDraft.address}
                  onChangeText={(v) => setTitularDraft((c) => ({ ...c, address: v }))}
                  placeholder="Rua e número"
                  placeholderTextColor={colors.ink4}
                  maxLength={200}
                />
              </View>

              {/* complemento */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Complemento</Text>
                <TextInput
                  style={styles.input}
                  value={titularDraft.complement}
                  onChangeText={(v) => setTitularDraft((c) => ({ ...c, complement: v }))}
                  placeholder="Apto, bloco, etc."
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                />
              </View>

              {/* município */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Município</Text>
                <TextInput
                  style={styles.input}
                  value={titularDraft.city}
                  onChangeText={(v) => setTitularDraft((c) => ({ ...c, city: v }))}
                  placeholder="Nome da cidade"
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                />
              </View>

              {/* estado */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Estado</Text>
                <Pressable style={styles.dateButton} onPress={() => setShowTitularStatePicker(!showTitularStatePicker)}>
                  <Text style={titularDraft.state ? styles.dateButtonTextFilled : styles.dateButtonText}>
                    {titularDraft.state || 'Selecionar estado'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.brand} />
                </Pressable>
                {showTitularStatePicker && (
                  <View style={styles.pickerDropdown}>
                    <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                      {ESTADO_OPTIONS.map((uf) => (
                        <Pressable
                          key={uf}
                          style={[styles.pickerOption, titularDraft.state === uf && styles.pickerOptionActive]}
                          onPress={() => { setTitularDraft((c) => ({ ...c, state: uf })); setShowTitularStatePicker(false); }}
                        >
                          <Text style={[styles.pickerOptionText, titularDraft.state === uf && styles.pickerOptionTextActive]}>{uf}</Text>
                          {titularDraft.state === uf && <Ionicons name="checkmark" size={18} color={colors.brand} />}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* telefone */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Telefone <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, titularErrors.phone && styles.inputError]}
                  value={titularDraft.phone}
                  onChangeText={(v) => { setTitularDraft((c) => ({ ...c, phone: formatPhone(v) })); clearTitularError('phone'); }}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={colors.ink4}
                  maxLength={15}
                  keyboardType="phone-pad"
                />
                {titularErrors.phone && <Text style={styles.errorText}>{titularErrors.phone}</Text>}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.cancelButton, savingTitular && styles.buttonDisabled]}
                onPress={() => setIsTitularModalOpen(false)}
                disabled={savingTitular}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, savingTitular && styles.buttonDisabled]}
                onPress={handleSaveTitular}
                disabled={savingTitular}
              >
                {savingTitular ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ——— Modal: criar/editar dependente ——— */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setIsModalOpen(false)}
      >
        <StatusBar style="light" backgroundColor={colors.dimDark} translucent />
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsModalOpen(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {draft.id ? 'Editar dependente' : 'Novo dependente'}
              </Text>
              <Pressable style={styles.modalClose} onPress={() => setIsModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={18} color={colors.ink2} />
              </Pressable>
            </View>
            <Text style={styles.legend}>
              Campos com <Text style={styles.required}>*</Text> são obrigatórios
            </Text>

            <ScrollView
              ref={modalScrollRef}
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              onScroll={(e) => { modalScrollY.current = e.nativeEvent.contentOffset.y; }}
              scrollEventThrottle={16}
            >
              <View style={styles.photoRow}>
                {draft.photoUri ? (
                  <Image source={{ uri: draft.photoUri }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="person" size={24} color={colors.brand} />
                  </View>
                )}
                <View style={styles.photoActions}>
                  <Pressable style={styles.photoButton} onPress={() => handlePickImage(false)}>
                    <Ionicons name="image-outline" size={14} color={colors.white} />
                    <Text style={styles.photoButtonText}>Galeria</Text>
                  </Pressable>
                  <Pressable style={styles.photoButton} onPress={() => handlePickImage(true)}>
                    <Ionicons name="camera-outline" size={14} color={colors.white} />
                    <Text style={styles.photoButtonText}>Câmera</Text>
                  </Pressable>
                  {draft.photoUri ? (
                    <Pressable
                      style={[styles.photoButton, styles.photoButtonGhost]}
                      onPress={() => setDraft((c) => ({ ...c, photoUri: undefined }))}
                    >
                      <Text style={[styles.photoButtonText, styles.photoButtonTextGhost]}>Remover</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome <Text style={styles.required}>*</Text></Text>
                <TextInput
                  ref={nameInputRef}
                  style={[styles.input, errors.name && styles.inputError]}
                  value={draft.name}
                  onChangeText={(v) => { setDraft((c) => ({ ...c, name: v })); clearError('name'); }}
                  placeholder="Nome completo"
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nascimento <Text style={styles.required}>*</Text></Text>
                <Pressable
                  ref={birthDateRef}
                  style={[styles.dateButton, errors.birthDate && styles.inputError]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={draft.birthDate ? styles.dateButtonTextFilled : styles.dateButtonText}>
                    {draft.birthDate ? formatDateToBR(draft.birthDate) : 'Selecionar data'}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={colors.brand} />
                </Pressable>
                {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
                {showDatePicker && (
                  <DateTimePicker
                    value={draft.birthDate ? new Date(draft.birthDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_event: any, selectedDate?: Date) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        const dateStr = selectedDate.toISOString().split('T')[0];
                        setDraft((c) => ({ ...c, birthDate: dateStr }));
                        clearError('birthDate');
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Parentesco <Text style={styles.required}>*</Text></Text>
                <Pressable
                  ref={relationshipRef}
                  style={[styles.dateButton, errors.relationship && styles.inputError]}
                  onPress={() => setShowRelationshipPicker(!showRelationshipPicker)}
                >
                  <Text style={draft.relationship ? styles.dateButtonTextFilled : styles.dateButtonText}>
                    {draft.relationship || 'Selecionar parentesco'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.brand} />
                </Pressable>
                {errors.relationship && <Text style={styles.errorText}>{errors.relationship}</Text>}
                {showRelationshipPicker && (
                  <View style={styles.pickerDropdown}>
                    <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                      {RELATIONSHIP_OPTIONS.map((option) => (
                        <Pressable
                          key={option}
                          style={[styles.pickerOption, draft.relationship === option && styles.pickerOptionActive]}
                          onPress={() => { setDraft((c) => ({ ...c, relationship: option })); setShowRelationshipPicker(false); clearError('relationship'); }}
                        >
                          <Text style={[styles.pickerOptionText, draft.relationship === option && styles.pickerOptionTextActive]}>{option}</Text>
                          {draft.relationship === option && <Ionicons name="checkmark" size={18} color={colors.brand} />}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Sexo <Text style={styles.required}>*</Text></Text>
                <View ref={sexRef} style={styles.sexRow}>
                  {SEX_OPTIONS.map((option) => {
                    const isActive = draft.sex === option;
                    return (
                      <Pressable
                        key={option}
                        style={[styles.sexChip, isActive && styles.sexChipActive, errors.sex && !isActive && styles.inputError]}
                        onPress={() => { setDraft((c) => ({ ...c, sex: option })); clearError('sex'); }}
                      >
                        <Text style={[styles.sexChipText, isActive && styles.sexChipTextActive]}>{option}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {errors.sex && <Text style={styles.errorText}>{errors.sex}</Text>}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Local de nascimento</Text>
                <TextInput
                  style={styles.input}
                  value={draft.birthPlace}
                  onChangeText={(v) => setDraft((c) => ({ ...c, birthPlace: v }))}
                  placeholder="Ex: São Paulo - SP"
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CNS</Text>
                <TextInput
                  style={styles.input}
                  value={draft.cns}
                  onChangeText={(v) => setDraft((c) => ({ ...c, cns: formatCns(v) }))}
                  placeholder="000 0000 0000 0000"
                  placeholderTextColor={colors.ink4}
                  keyboardType="numeric"
                  maxLength={18}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome da mãe ou responsável</Text>
                <TextInput
                  style={styles.input}
                  value={draft.guardianName}
                  onChangeText={(v) => setDraft((c) => ({ ...c, guardianName: v }))}
                  placeholder="Nome do responsável"
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CEP <Text style={styles.required}>*</Text></Text>
                <TextInput
                  ref={zipCodeRef}
                  style={[styles.input, errors.zipCode && styles.inputError]}
                  value={draft.zipCode}
                  onChangeText={(v) => { setDraft((c) => ({ ...c, zipCode: formatCep(v) })); clearError('zipCode'); }}
                  onBlur={() => fetchCep(draft.zipCode || '')}
                  placeholder="00000-000"
                  placeholderTextColor={colors.ink4}
                  keyboardType="numeric"
                  maxLength={9}
                />
                {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Rua</Text>
                <TextInput
                  style={styles.input}
                  value={draft.address}
                  onChangeText={(v) => setDraft((c) => ({ ...c, address: v }))}
                  placeholder="Rua e número"
                  placeholderTextColor={colors.ink4}
                  maxLength={200}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Complemento</Text>
                <TextInput
                  style={styles.input}
                  value={draft.complement}
                  onChangeText={(v) => setDraft((c) => ({ ...c, complement: v }))}
                  placeholder="Apto, bloco, etc."
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Município</Text>
                <TextInput
                  style={styles.input}
                  value={draft.city}
                  onChangeText={(v) => setDraft((c) => ({ ...c, city: v }))}
                  placeholder="Nome da cidade"
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Estado</Text>
                <Pressable style={styles.dateButton} onPress={() => setShowStatePicker(!showStatePicker)}>
                  <Text style={draft.state ? styles.dateButtonTextFilled : styles.dateButtonText}>
                    {draft.state || 'Selecionar estado'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.brand} />
                </Pressable>
                {showStatePicker && (
                  <View style={styles.pickerDropdown}>
                    <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                      {ESTADO_OPTIONS.map((uf) => (
                        <Pressable
                          key={uf}
                          style={[styles.pickerOption, draft.state === uf && styles.pickerOptionActive]}
                          onPress={() => { setDraft((c) => ({ ...c, state: uf })); setShowStatePicker(false); }}
                        >
                          <Text style={[styles.pickerOptionText, draft.state === uf && styles.pickerOptionTextActive]}>{uf}</Text>
                          {draft.state === uf && <Ionicons name="checkmark" size={18} color={colors.brand} />}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Telefone <Text style={styles.required}>*</Text></Text>
                <TextInput
                  ref={phoneRef}
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={draft.phone}
                  onChangeText={(v) => { setDraft((c) => ({ ...c, phone: formatPhone(v) })); clearError('phone'); }}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={colors.ink4}
                  maxLength={15}
                  keyboardType="phone-pad"
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.cancelButton, savingDependent && styles.buttonDisabled]}
                onPress={() => setIsModalOpen(false)}
                disabled={savingDependent}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, savingDependent && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={savingDependent}
              >
                {savingDependent ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <DependentInfoModal
        visible={selectedDependent !== null}
        dependent={selectedDependent}
        onClose={() => setSelectedDependent(null)}
      />

      {/* ——— Modal: ajuda ——— */}
      <Modal
        visible={isHelpModalOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setIsHelpModalOpen(false)}
      >
        <StatusBar style="light" backgroundColor={colors.dimDark} translucent />
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsHelpModalOpen(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajuda</Text>
              <Pressable style={styles.modalClose} onPress={() => setIsHelpModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={18} color={colors.ink2} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.helpSection}>
                <View style={styles.helpIconRow}>
                  <Ionicons name="wallet-outline" size={20} color={colors.brand} />
                  <Text style={styles.helpSectionTitle}>Carteira de vacinação</Text>
                </View>
                <Text style={styles.helpText}>
                  Registre e acompanhe vacinas obrigatórias do calendário nacional, vacinas adicionais e participações em campanhas. Toque em qualquer vacina para marcar como aplicada e preencher os detalhes.
                </Text>
              </View>
              <View style={styles.helpSection}>
                <View style={styles.helpIconRow}>
                  <Ionicons name="time-outline" size={20} color={colors.brand} />
                  <Text style={styles.helpSectionTitle}>Histórico</Text>
                </View>
                <Text style={styles.helpText}>
                  Consulte todos os registros de vacinação do perfil selecionado em ordem cronológica.
                </Text>
              </View>
              <View style={styles.helpSection}>
                <View style={styles.helpIconRow}>
                  <Ionicons name="book-outline" size={20} color={colors.brand} />
                  <Text style={styles.helpSectionTitle}>Informações</Text>
                </View>
                <Text style={styles.helpText}>
                  Explore o guia de vacinas por faixa etária e acesse conteúdos educativos sobre imunização.
                </Text>
              </View>
              <View style={styles.helpSection}>
                <View style={styles.helpIconRow}>
                  <Ionicons name="people-outline" size={20} color={colors.brand} />
                  <Text style={styles.helpSectionTitle}>Dependentes</Text>
                </View>
                <Text style={styles.helpText}>
                  Adicione filhos, idosos ou outros familiares na aba Perfil para acompanhar a vacinação deles separadamente.
                </Text>
              </View>
              <View style={styles.helpSection}>
                <View style={styles.helpIconRow}>
                  <Ionicons name="person-outline" size={20} color={colors.brand} />
                  <Text style={styles.helpSectionTitle}>Perfis</Text>
                </View>
                <Text style={styles.helpText}>
                  Na carteira de vacinação, toque no ícone de perfil no cabeçalho para alternar entre o seu perfil e o de dependentes cadastrados.
                </Text>
              </View>
              <View style={styles.helpSection}>
                <View style={styles.helpIconRow}>
                  <Ionicons name="mail-outline" size={20} color={colors.brand} />
                  <Text style={styles.helpSectionTitle}>Contato</Text>
                </View>
                <Text style={styles.helpText}>
                  Dúvidas, sugestões ou problemas? Entre em contato pelo e-mail{' '}
                  <Text style={{ color: colors.brandInk, fontWeight: '600' }}>contato@locvac.com.br</Text>
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <StatusBar style={anyModalOpen ? 'light' : 'dark'} />
    </View>
  );
}
