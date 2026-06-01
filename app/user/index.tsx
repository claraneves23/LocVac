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
  Linking,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';

import * as ImagePicker from 'expo-image-picker';
import * as NavigationBar from 'expo-navigation-bar';
import { FamilyMember } from '../../src/types/vaccination';
import { addDependentAndLink, updateDependent, deleteDependent } from '../../src/service/dependentsService';
import { updateTitular } from '../../src/service/authService';
import { uploadPessoaFoto, deletePessoaFoto } from '../../src/service/pessoaFotoService';
import { invalidatePhotoCache, usePhotoSource } from '../../src/hooks/usePhotoSource';
import { useAppContext } from '../../src/context/AppContext';
import { joinAddress, splitAddress } from '../../src/utils/address';
import { sanitizeName } from '../../src/utils/nameSanitizer';
import {
  sanitizeStreet,
  sanitizeStreetNumber,
  sanitizeComplement,
  sanitizeNeighborhood,
  sanitizeCity,
} from '../../src/utils/addressSanitizers';
import { minBirthDate } from '../../src/utils/dateBounds';
import logger from '../../src/utils/logger';
import DependentInfoModal from '../../components/modals/DependentInfoModal';
import { radii, spacing, typography, shadows, Tone } from '../../src/theme/tokens';
import { Avatar, ScreenTitle, DateField } from '../../components/redesign';
import { makeStyles } from '../../src/styles/user';
import { useTheme } from '../../src/context/ThemeContext';
import {
  formatCep,
  formatCns,
  formatCpf,
  formatDateToBR,
  formatPhone,
} from '../../src/utils/format';
import { useKeyboardHeight } from '../../src/hooks/useKeyboardHeight';
import { fetchMunicipios } from '../../src/utils/municipios';

const SEX_OPTIONS = ['M', 'F'] as const;
const RELATIONSHIP_OPTIONS = ['Filho', 'Filha', 'Neto', 'Neta', 'Sobrinho', 'Sobrinha', 'Irmão', 'Irmã', 'Outro'];
const ESTADO_OPTIONS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'] as const;
type EstadoUF = typeof ESTADO_OPTIONS[number];

const DEPENDENT_TONES: Tone[] = ['brand', 'coral', 'ochre'];

type DraftDependent = {
  id?: string;
  name: string;
  birthDate: string;
  birthCity?: string;
  birthState?: EstadoUF | '';
  relationship: string;
  guardianName?: string;
  sex: 'M' | 'F' | '';
  photoUri?: string;
  cpf?: string;
  cns?: string;
  zipCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: EstadoUF | '';
  phone?: string;
};

type DraftTitular = {
  name: string;
  birthDate: string;
  sex: 'M' | 'F' | '';
  photoUri?: string;
  cpf?: string;
  cns?: string;
  zipCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: EstadoUF | '';
  phone?: string;
};

export default function User() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { mainUser, dependents, usuarioId, refreshDependents, refreshMainUser } = useAppContext();
  const keyboardHeight = useKeyboardHeight();

  // — dependent modal state —
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDependent, setSelectedDependent] = useState<FamilyMember | null>(null);
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);
  const [savingDependent, setSavingDependent] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showBirthStatePicker, setShowBirthStatePicker] = useState(false);
  const [showBirthCityPicker, setShowBirthCityPicker] = useState(false);
  const [birthCityOptions, setBirthCityOptions] = useState<string[]>([]);
  const [birthCitySearch, setBirthCitySearch] = useState('');
  const [loadingBirthCities, setLoadingBirthCities] = useState(false);
  const [draft, setDraft] = useState<DraftDependent>({
    name: '', birthDate: '', birthCity: '', birthState: '', relationship: '',
    guardianName: '', sex: '', photoUri: undefined,
    address: '', addressNumber: '', neighborhood: '', city: '', state: '', zipCode: '', phone: '',
  });
  type DepFieldKey = 'name' | 'birthDate' | 'relationship' | 'sex' | 'zipCode' | 'phone';
  const [errors, setErrors] = useState<Partial<Record<DepFieldKey, string>>>({});
  const [sameAddressAsTitular, setSameAddressAsTitular] = useState(true);
  const originalDependentPhoto = useRef<string | undefined>(undefined);
  const originalTitularPhoto = useRef<string | undefined>(undefined);

  // — titular modal state —
  const [isTitularModalOpen, setIsTitularModalOpen] = useState(false);
  const [savingTitular, setSavingTitular] = useState(false);
  const [showTitularStatePicker, setShowTitularStatePicker] = useState(false);
  const [titularDraft, setTitularDraft] = useState<DraftTitular>({
    name: '', birthDate: '', sex: '', photoUri: undefined,
    cns: '', zipCode: '', address: '', addressNumber: '', complement: '', neighborhood: '', city: '', state: '', phone: '',
  });
  type TitularFieldKey = 'name' | 'birthDate' | 'sex' | 'zipCode' | 'phone';
  const [titularErrors, setTitularErrors] = useState<Partial<Record<TitularFieldKey, string>>>({});
  const titularPhotoSrc = usePhotoSource(titularDraft.photoUri);
  const dependentPhotoSrc = usePhotoSource(draft.photoUri);

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
          await NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
        }
      } catch (error) {
        logger.warn('NavigationBar API não disponível no Expo Go');
      }
    };
    updateSystemBars();
  }, [anyModalOpen, isDark]);

  const lookupCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return null;
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`).catch(() => null);
    if (!response?.ok) return null;
    const data = await response.json().catch(() => null);
    return data?.erro ? null : data;
  };

  const fetchCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    if (lastFetchedCep.current === digits) return;
    lastFetchedCep.current = digits;
    const data = await lookupCep(cep);
    if (!data) return;
    setDraft((c) => ({
      ...c,
      ...(data.logradouro && { address: data.logradouro, addressNumber: '' }),
      ...(data.bairro && { neighborhood: data.bairro }),
      ...(data.localidade && { city: data.localidade }),
      ...(data.uf && { state: data.uf as EstadoUF }),
    }));
  };

  const fetchTitularCep = async (cep: string) => {
    const data = await lookupCep(cep);
    if (!data) return;
    setTitularDraft((c) => ({
      ...c,
      ...(data.logradouro && { address: data.logradouro, addressNumber: '' }),
      ...(data.bairro && { neighborhood: data.bairro }),
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
  const lastFetchedCep = useRef<string>('');

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
    setDraft({ name: '', birthDate: '', birthCity: '', birthState: '', relationship: '', guardianName: '', sex: '',
      photoUri: undefined, cpf: '', cns: '', zipCode: '', address: '', addressNumber: '', complement: '', neighborhood: '', city: '', state: '', phone: '' });
    setShowRelationshipPicker(false);
    setShowStatePicker(false);
    setShowBirthStatePicker(false);
    setShowBirthCityPicker(false);
    setBirthCityOptions([]);
    setBirthCitySearch('');
    setErrors({});
  };

  const loadBirthCities = async (uf: string) => {
    setLoadingBirthCities(true);
    try {
      const cidades = await fetchMunicipios(uf);
      setBirthCityOptions(cidades);
    } finally {
      setLoadingBirthCities(false);
    }
  };

  const titularAddressFields = () => {
    if (!mainUser) {
      return { zipCode: '', address: '', addressNumber: '', complement: '', neighborhood: '', city: '', state: '' as EstadoUF | '' };
    }
    const { rua: titRua, numero: titNumero } = splitAddress(mainUser.address);
    return {
      zipCode: mainUser.zipCode ? formatCep(mainUser.zipCode) : '',
      address: titRua,
      addressNumber: titNumero,
      complement: mainUser.complement || '',
      neighborhood: mainUser.neighborhood || '',
      city: mainUser.city || '',
      state: (mainUser.state as EstadoUF) || '',
    };
  };

  const openCreate = () => {
    resetDraft();
    setDraft((c) => ({ ...c, ...titularAddressFields() }));
    setSameAddressAsTitular(true);
    originalDependentPhoto.current = undefined;
    modalScrollY.current = 0;
    setIsModalOpen(true);
  };

  const openEdit = (dependent: FamilyMember) => {
    const { rua: depRua, numero: depNumero } = splitAddress(dependent.address);
    const isTitularGuardian = dependent.relationship === 'Filho' || dependent.relationship === 'Filha';
    const tit = titularAddressFields();
    const matchesTitular = mainUser
      ? (dependent.zipCode || '') === (mainUser.zipCode || '')
        && (depRua === tit.address)
        && (depNumero === tit.addressNumber)
        && ((dependent.complement || '') === tit.complement)
        && ((dependent.neighborhood || '') === tit.neighborhood)
        && ((dependent.city || '') === tit.city)
        && (((dependent.state as EstadoUF) || '') === tit.state)
      : false;
    setDraft({
      id: dependent.id,
      name: dependent.name,
      birthDate: dependent.birthDate,
      birthCity: dependent.birthCity || '',
      birthState: (dependent.birthState as EstadoUF) || '',
      relationship: dependent.relationship || '',
      guardianName: isTitularGuardian ? (mainUser?.name || '') : (dependent.guardianName || ''),
      sex: dependent.sex === 'M' || dependent.sex === 'F' ? dependent.sex : '',
      photoUri: dependent.photoUri,
      cpf: dependent.cpf ? formatCpf(dependent.cpf) : '',
      cns: dependent.cns ? formatCns(dependent.cns) : '',
      zipCode: dependent.zipCode ? formatCep(dependent.zipCode) : '',
      address: depRua,
      addressNumber: depNumero,
      complement: dependent.complement || '',
      neighborhood: dependent.neighborhood || '',
      city: dependent.city || '',
      state: (dependent.state as EstadoUF) || '',
      phone: formatPhone(dependent.phone || ''),
    });
    setSameAddressAsTitular(matchesTitular);
    originalDependentPhoto.current = dependent.photoUri;
    setShowRelationshipPicker(false);
    setShowBirthStatePicker(false);
    setShowBirthCityPicker(false);
    setBirthCitySearch('');
    setBirthCityOptions([]);
    if (dependent.birthState) loadBirthCities(dependent.birthState);
    setErrors({});
    modalScrollY.current = 0;
    setIsModalOpen(true);
  };

  const syncFoto = async (pessoaId: string, original: string | undefined, current: string | undefined) => {
    if (current === original) return;
    if (current && current.startsWith('data:')) {
      try {
        await uploadPessoaFoto(pessoaId, current);
        if (original) invalidatePhotoCache(original);
      } catch (e: any) {
        logger.error('Erro ao subir foto:', e?.response?.status);
      }
      return;
    }
    if (!current && original) {
      try {
        await deletePessoaFoto(pessoaId);
        invalidatePhotoCache(original);
      } catch (e: any) {
        logger.error('Erro ao remover foto:', e?.response?.status);
      }
    }
  };

  const toggleSameAddress = () => {
    if (sameAddressAsTitular) {
      setSameAddressAsTitular(false);
      return;
    }
    setDraft((c) => ({ ...c, ...titularAddressFields() }));
    clearError('zipCode');
    setShowStatePicker(false);
    setSameAddressAsTitular(true);
  };

  const handleSave = async () => {
    if (savingDependent) return;
    if (!validateDraft() || !mainUser) return;
    setSavingDependent(true);
    try {
      const payload = {
        ...draft,
        sex: draft.sex as 'M' | 'F',
        cpf: draft.cpf?.replace(/\D/g, '') || undefined,
        cns: draft.cns?.replace(/\D/g, '') || undefined,
        zipCode: draft.zipCode?.replace(/\D/g, '') || undefined,
        address: joinAddress(draft.address || '', draft.addressNumber || ''),
      };
      let savedPessoaId: string;
      if (draft.id) {
        await updateDependent(draft.id, payload);
        savedPessoaId = draft.id;
      } else {
        const newId = await addDependentAndLink(usuarioId!, payload);
        savedPessoaId = String(newId);
      }
      await syncFoto(savedPessoaId, originalDependentPhoto.current, draft.photoUri);
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
    const { rua: titRua, numero: titNumero } = splitAddress(mainUser.address);
    setTitularDraft({
      name: mainUser.name,
      birthDate: mainUser.birthDate,
      sex: mainUser.sex === 'M' || mainUser.sex === 'F' ? mainUser.sex : '',
      photoUri: mainUser.photoUri,
      cpf: mainUser.cpf ? formatCpf(mainUser.cpf) : '',
      cns: mainUser.cns ? formatCns(mainUser.cns) : '',
      zipCode: mainUser.zipCode ? formatCep(mainUser.zipCode) : '',
      address: titRua,
      addressNumber: titNumero,
      complement: mainUser.complement || '',
      neighborhood: mainUser.neighborhood || '',
      city: mainUser.city || '',
      state: (mainUser.state as EstadoUF) || '',
      phone: formatPhone(mainUser.phone || ''),
    });
    setTitularErrors({});
    setShowTitularStatePicker(false);
    originalTitularPhoto.current = mainUser.photoUri;
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
        rua: joinAddress(titularDraft.address || '', titularDraft.addressNumber || ''),
        complemento: titularDraft.complement,
        bairro: titularDraft.neighborhood,
        municipio: titularDraft.city,
        estado: titularDraft.state || undefined,
        telefone: (titularDraft.phone || '').replace(/\D/g, ''),
      });
      await syncFoto(mainUser.id, originalTitularPhoto.current, titularDraft.photoUri);
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
            <Avatar name={mainUser.name} photoUri={mainUser.photoUri} size={72} tone="brand" active />
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{mainUser.name}</Text>
              <View style={styles.profileTagRow}>
                <View style={styles.profileTag}>
                  <Ionicons name="shield-checkmark" size={11} color={colors.brandInk} />
                  <Text style={styles.profileTagText}>{dependents.length > 0 ? 'Responsável' : 'Titular'}</Text>
                </View>
              </View>
              <Text style={styles.profileEmail} numberOfLines={1}>{mainUser.email}</Text>
            </View>
            <Pressable style={styles.iconButton} onPress={openEditTitular} hitSlop={8}>
              <Ionicons name="create-outline" size={18} color={colors.brandInk} />
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
                <Ionicons name="people-outline" size={22} color={colors.brandInk} />
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
                        <Ionicons name="create-outline" size={18} color={colors.brandInk} />
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
                <Ionicons name="settings-outline" size={18} color={colors.brandInk} />
              </View>
              <Text style={styles.menuLabel}>Configurações</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.ink4} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => setIsHelpModalOpen(true)}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="help-circle-outline" size={18} color={colors.brandInk} />
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
        <View style={[styles.modalOverlay, { paddingBottom: keyboardHeight }]}>
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
                {titularPhotoSrc ? (
                  <Image source={{ uri: titularPhotoSrc }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="person" size={24} color={colors.brandInk} />
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
                  onChangeText={(v) => { setTitularDraft((c) => ({ ...c, name: sanitizeName(v) })); clearTitularError('name'); }}
                  placeholder="Nome completo"
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                />
                {titularErrors.name && <Text style={styles.errorText}>{titularErrors.name}</Text>}
              </View>

              {/* nascimento */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nascimento <Text style={styles.required}>*</Text></Text>
                <DateField
                  value={titularDraft.birthDate}
                  onChange={(iso) => { setTitularDraft((c) => ({ ...c, birthDate: iso })); clearTitularError('birthDate'); }}
                  error={!!titularErrors.birthDate}
                  maximumDate={new Date()}
                  minimumDate={minBirthDate()}
                />
                {titularErrors.birthDate && <Text style={styles.errorText}>{titularErrors.birthDate}</Text>}
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

              {/* CPF (somente leitura) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CPF</Text>
                <TextInput
                  style={[styles.input, styles.inputReadonly]}
                  value={titularDraft.cpf}
                  editable={false}
                  placeholder="Não informado"
                  placeholderTextColor={colors.ink4}
                />
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
                  onChangeText={(v) => setTitularDraft((c) => ({ ...c, address: sanitizeStreet(v) }))}
                  placeholder="Nome da rua"
                  placeholderTextColor={colors.ink4}
                  maxLength={200}
                />
              </View>

              {/* número */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Número</Text>
                <TextInput
                  style={styles.input}
                  value={titularDraft.addressNumber}
                  onChangeText={(v) => setTitularDraft((c) => ({ ...c, addressNumber: sanitizeStreetNumber(v) }))}
                  placeholder="Ex: 123"
                  placeholderTextColor={colors.ink4}
                  maxLength={20}
                />
              </View>

              {/* complemento */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Complemento</Text>
                <TextInput
                  style={styles.input}
                  value={titularDraft.complement}
                  onChangeText={(v) => setTitularDraft((c) => ({ ...c, complement: sanitizeComplement(v) }))}
                  placeholder="Apto, bloco, etc."
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                />
              </View>

              {/* bairro */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Bairro</Text>
                <TextInput
                  style={styles.input}
                  value={titularDraft.neighborhood}
                  onChangeText={(v) => setTitularDraft((c) => ({ ...c, neighborhood: sanitizeNeighborhood(v) }))}
                  placeholder="Nome do bairro"
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
                  onChangeText={(v) => setTitularDraft((c) => ({ ...c, city: sanitizeCity(v) }))}
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
                  <Ionicons name="chevron-down" size={18} color={colors.brandInk} />
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
                          {titularDraft.state === uf && <Ionicons name="checkmark" size={18} color={colors.brandInk} />}
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
        <View style={[styles.modalOverlay, { paddingBottom: keyboardHeight }]}>
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
                {dependentPhotoSrc ? (
                  <Image source={{ uri: dependentPhotoSrc }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="person" size={24} color={colors.brandInk} />
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
                  onChangeText={(v) => { setDraft((c) => ({ ...c, name: sanitizeName(v) })); clearError('name'); }}
                  placeholder="Nome completo"
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nascimento <Text style={styles.required}>*</Text></Text>
                <View ref={birthDateRef}>
                  <DateField
                    value={draft.birthDate}
                    onChange={(iso) => { setDraft((c) => ({ ...c, birthDate: iso })); clearError('birthDate'); }}
                    error={!!errors.birthDate}
                    maximumDate={new Date()}
                    minimumDate={minBirthDate()}
                  />
                </View>
                {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
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
                  <Ionicons name="chevron-down" size={18} color={colors.brandInk} />
                </Pressable>
                {errors.relationship && <Text style={styles.errorText}>{errors.relationship}</Text>}
                {showRelationshipPicker && (
                  <View style={styles.pickerDropdown}>
                    <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                      {RELATIONSHIP_OPTIONS.map((option) => {
                        const isParentRel = option === 'Filho' || option === 'Filha';
                        return (
                        <Pressable
                          key={option}
                          style={[styles.pickerOption, draft.relationship === option && styles.pickerOptionActive]}
                          onPress={() => {
                            setDraft((c) => {
                              const wasParentRel = c.relationship === 'Filho' || c.relationship === 'Filha';
                              let nextGuardian = c.guardianName;
                              if (isParentRel) {
                                nextGuardian = mainUser?.name || '';
                              } else if (wasParentRel) {
                                nextGuardian = '';
                              }
                              return { ...c, relationship: option, guardianName: nextGuardian };
                            });
                            setShowRelationshipPicker(false);
                            clearError('relationship');
                          }}
                        >
                          <Text style={[styles.pickerOptionText, draft.relationship === option && styles.pickerOptionTextActive]}>{option}</Text>
                          {draft.relationship === option && <Ionicons name="checkmark" size={18} color={colors.brandInk} />}
                        </Pressable>
                        );
                      })}
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
                <Pressable
                  style={styles.dateButton}
                  onPress={() => { setShowBirthStatePicker(!showBirthStatePicker); setShowBirthCityPicker(false); }}
                >
                  <Text style={draft.birthState ? styles.dateButtonTextFilled : styles.dateButtonText}>
                    {draft.birthState || 'Selecionar estado'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.brandInk} />
                </Pressable>
                {showBirthStatePicker && (
                  <View style={styles.pickerDropdown}>
                    <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                      {ESTADO_OPTIONS.map((uf) => (
                        <Pressable
                          key={uf}
                          style={[styles.pickerOption, draft.birthState === uf && styles.pickerOptionActive]}
                          onPress={() => {
                            const changed = draft.birthState !== uf;
                            setDraft((c) => ({ ...c, birthState: uf, ...(changed && { birthCity: '' }) }));
                            setShowBirthStatePicker(false);
                            if (changed) {
                              setBirthCityOptions([]);
                              setBirthCitySearch('');
                              loadBirthCities(uf);
                            }
                          }}
                        >
                          <Text style={[styles.pickerOptionText, draft.birthState === uf && styles.pickerOptionTextActive]}>{uf}</Text>
                          {draft.birthState === uf && <Ionicons name="checkmark" size={18} color={colors.brandInk} />}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
                <Pressable
                  style={[styles.dateButton, { marginTop: 8 }, !draft.birthState && styles.inputReadonly]}
                  onPress={() => {
                    if (!draft.birthState) return;
                    setShowBirthCityPicker(!showBirthCityPicker);
                    setShowBirthStatePicker(false);
                  }}
                  disabled={!draft.birthState}
                >
                  <Text style={draft.birthCity ? styles.dateButtonTextFilled : styles.dateButtonText}>
                    {draft.birthCity || (draft.birthState ? 'Selecionar cidade' : 'Selecione um estado primeiro')}
                  </Text>
                  {loadingBirthCities ? (
                    <ActivityIndicator size="small" color={colors.brandInk} />
                  ) : (
                    <Ionicons name="chevron-down" size={18} color={colors.brandInk} />
                  )}
                </Pressable>
                {showBirthCityPicker && draft.birthState && (
                  <View style={styles.pickerDropdown}>
                    <TextInput
                      style={[styles.input, { margin: 8 }]}
                      value={birthCitySearch}
                      onChangeText={setBirthCitySearch}
                      placeholder="Buscar cidade..."
                      placeholderTextColor={colors.ink4}
                    />
                    <ScrollView style={styles.pickerScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                      {birthCityOptions
                        .filter((nome) => nome.toLowerCase().includes(birthCitySearch.trim().toLowerCase()))
                        .map((nome) => (
                          <Pressable
                            key={nome}
                            style={[styles.pickerOption, draft.birthCity === nome && styles.pickerOptionActive]}
                            onPress={() => {
                              setDraft((c) => ({ ...c, birthCity: nome }));
                              setShowBirthCityPicker(false);
                              setBirthCitySearch('');
                            }}
                          >
                            <Text style={[styles.pickerOptionText, draft.birthCity === nome && styles.pickerOptionTextActive]}>{nome}</Text>
                            {draft.birthCity === nome && <Ionicons name="checkmark" size={18} color={colors.brandInk} />}
                          </Pressable>
                        ))}
                      {!loadingBirthCities && birthCityOptions.length === 0 && (
                        <Text style={[styles.dateButtonText, { padding: 12, textAlign: 'center' }]}>
                          Nenhuma cidade encontrada.
                        </Text>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CPF</Text>
                <TextInput
                  style={styles.input}
                  value={draft.cpf}
                  onChangeText={(v) => setDraft((c) => ({ ...c, cpf: formatCpf(v) }))}
                  placeholder="000.000.000-00"
                  placeholderTextColor={colors.ink4}
                  keyboardType="numeric"
                  maxLength={14}
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

              {(() => {
                const isTitularGuardian = draft.relationship === 'Filho' || draft.relationship === 'Filha';
                return (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Nome da mãe ou responsável</Text>
                    <TextInput
                      style={[styles.input, isTitularGuardian && styles.inputReadonly]}
                      value={draft.guardianName}
                      onChangeText={(v) => setDraft((c) => ({ ...c, guardianName: sanitizeName(v) }))}
                      placeholder="Nome do responsável"
                      placeholderTextColor={colors.ink4}
                      maxLength={100}
                      editable={!isTitularGuardian}
                    />
                  </View>
                );
              })()}

              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>CEP <Text style={styles.required}>*</Text></Text>
                  <Pressable
                    onPress={toggleSameAddress}
                    style={[styles.sameAddrToggle, sameAddressAsTitular && styles.sameAddrToggleActive]}
                    hitSlop={6}
                  >
                    <Ionicons
                      name={sameAddressAsTitular ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={sameAddressAsTitular ? colors.white : colors.ink2}
                    />
                    <Text style={[styles.sameAddrToggleText, sameAddressAsTitular && styles.sameAddrToggleTextActive]}>
                      Mesmo do titular
                    </Text>
                  </Pressable>
                </View>
                <TextInput
                  ref={zipCodeRef}
                  style={[styles.input, errors.zipCode && styles.inputError, sameAddressAsTitular && styles.inputReadonly]}
                  value={draft.zipCode}
                  onChangeText={(v) => {
                    const formatted = formatCep(v);
                    setDraft((c) => ({ ...c, zipCode: formatted }));
                    clearError('zipCode');
                    if (formatted.replace(/\D/g, '').length === 8) fetchCep(formatted);
                  }}
                  placeholder="00000-000"
                  placeholderTextColor={colors.ink4}
                  keyboardType="numeric"
                  maxLength={9}
                  editable={!sameAddressAsTitular}
                />
                {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Rua</Text>
                <TextInput
                  style={[styles.input, sameAddressAsTitular && styles.inputReadonly]}
                  value={draft.address}
                  onChangeText={(v) => setDraft((c) => ({ ...c, address: sanitizeStreet(v) }))}
                  placeholder="Nome da rua"
                  placeholderTextColor={colors.ink4}
                  maxLength={200}
                  editable={!sameAddressAsTitular}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Número</Text>
                <TextInput
                  style={[styles.input, sameAddressAsTitular && styles.inputReadonly]}
                  value={draft.addressNumber}
                  onChangeText={(v) => setDraft((c) => ({ ...c, addressNumber: sanitizeStreetNumber(v) }))}
                  placeholder="Ex: 123"
                  placeholderTextColor={colors.ink4}
                  maxLength={20}
                  editable={!sameAddressAsTitular}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Complemento</Text>
                <TextInput
                  style={[styles.input, sameAddressAsTitular && styles.inputReadonly]}
                  value={draft.complement}
                  onChangeText={(v) => setDraft((c) => ({ ...c, complement: sanitizeComplement(v) }))}
                  placeholder="Apto, bloco, etc."
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                  editable={!sameAddressAsTitular}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Bairro</Text>
                <TextInput
                  style={[styles.input, sameAddressAsTitular && styles.inputReadonly]}
                  value={draft.neighborhood}
                  onChangeText={(v) => setDraft((c) => ({ ...c, neighborhood: sanitizeNeighborhood(v) }))}
                  placeholder="Nome do bairro"
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                  editable={!sameAddressAsTitular}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Município</Text>
                <TextInput
                  style={[styles.input, sameAddressAsTitular && styles.inputReadonly]}
                  value={draft.city}
                  onChangeText={(v) => setDraft((c) => ({ ...c, city: sanitizeCity(v) }))}
                  placeholder="Nome da cidade"
                  placeholderTextColor={colors.ink4}
                  maxLength={100}
                  editable={!sameAddressAsTitular}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Estado</Text>
                <Pressable
                  style={[styles.dateButton, sameAddressAsTitular && styles.inputReadonly]}
                  onPress={() => { if (!sameAddressAsTitular) setShowStatePicker(!showStatePicker); }}
                  disabled={sameAddressAsTitular}
                >
                  <Text style={draft.state ? styles.dateButtonTextFilled : styles.dateButtonText}>
                    {draft.state || 'Selecionar estado'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.brandInk} />
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
                          {draft.state === uf && <Ionicons name="checkmark" size={18} color={colors.brandInk} />}
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
                  <Ionicons name="wallet-outline" size={20} color={colors.brandInk} />
                  <Text style={styles.helpSectionTitle}>Carteira de vacinação</Text>
                </View>
                <Text style={styles.helpText}>
                  Registre e acompanhe vacinas obrigatórias do calendário nacional, vacinas adicionais e participações em campanhas. Toque em qualquer vacina para marcar como aplicada e preencher os detalhes.
                </Text>
              </View>
              <View style={styles.helpSection}>
                <View style={styles.helpIconRow}>
                  <Ionicons name="time-outline" size={20} color={colors.brandInk} />
                  <Text style={styles.helpSectionTitle}>Histórico</Text>
                </View>
                <Text style={styles.helpText}>
                  Consulte todos os registros de vacinação do perfil selecionado em ordem cronológica.
                </Text>
              </View>
              <View style={styles.helpSection}>
                <View style={styles.helpIconRow}>
                  <Ionicons name="book-outline" size={20} color={colors.brandInk} />
                  <Text style={styles.helpSectionTitle}>Informações</Text>
                </View>
                <Text style={styles.helpText}>
                  Explore o guia de vacinas por faixa etária e acesse conteúdos educativos sobre imunização.
                </Text>
              </View>
              <View style={styles.helpSection}>
                <View style={styles.helpIconRow}>
                  <Ionicons name="people-outline" size={20} color={colors.brandInk} />
                  <Text style={styles.helpSectionTitle}>Dependentes</Text>
                </View>
                <Text style={styles.helpText}>
                  Adicione filhos, idosos ou outros familiares na aba Perfil para acompanhar a vacinação deles separadamente.
                </Text>
              </View>
              <View style={styles.helpSection}>
                <View style={styles.helpIconRow}>
                  <Ionicons name="person-outline" size={20} color={colors.brandInk} />
                  <Text style={styles.helpSectionTitle}>Perfis</Text>
                </View>
                <Text style={styles.helpText}>
                  Na carteira de vacinação, toque no ícone de perfil no cabeçalho para alternar entre o seu perfil e o de dependentes cadastrados.
                </Text>
              </View>
              <View style={styles.helpSection}>
                <View style={styles.helpIconRow}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.brandInk} />
                  <Text style={styles.helpSectionTitle}>Política de Privacidade</Text>
                </View>
                <Text style={styles.helpText}>
                  Saiba como tratamos seus dados pessoais e de saúde, em conformidade com a LGPD. Acesse a política completa em{' '}
                  <Text
                    style={{ color: colors.brandInk, fontWeight: '600' }}
                    onPress={() => Linking.openURL('https://locvac.com.br/privacidade')}
                  >
                    locvac.com.br/privacidade
                  </Text>
                </Text>
              </View>
              <View style={styles.helpSection}>
                <View style={styles.helpIconRow}>
                  <Ionicons name="mail-outline" size={20} color={colors.brandInk} />
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
