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
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';

import * as ImagePicker from 'expo-image-picker';
import * as NavigationBar from 'expo-navigation-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { logout } from '../service/authService';
import { FamilyMember } from '../types/vaccination';
import { addDependentAndLink, updateDependent, deleteDependent } from '../service/dependentsService';
import { useAppContext } from '../context/AppContext';
import logger from '../utils/logger';
import DependentInfoModal from '../../components/modals/DependentInfoModal';
import { colors, radii, spacing, typography, shadows, tonePairs, Tone } from '../theme/tokens';
import { Avatar, ScreenTitle } from '../../components/redesign';
import styles from './styles';

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

export default function User() {
  const router = useRouter();
  const { mainUser, dependents, usuarioId, refreshDependents, reset } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDependent, setSelectedDependent] = useState<FamilyMember | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);
  const [savingDependent, setSavingDependent] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [draft, setDraft] = useState<DraftDependent>({
    name: '',
    birthDate: '',
    birthPlace: '',
    relationship: '',
    guardianName: '',
    sex: '',
    photoUri: undefined,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const formatDateToBR = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const updateSystemBars = async () => {
      if (Platform.OS !== 'android') return;
      try {
        if (isModalOpen) {
          await NavigationBar.setBackgroundColorAsync('#80000000');
          await NavigationBar.setButtonStyleAsync('light');
          await NavigationBar.setVisibilityAsync('visible');
        } else {
          await NavigationBar.setBackgroundColorAsync('#00FFFFFF');
          await NavigationBar.setButtonStyleAsync('dark');
        }
      } catch (error) {
        logger.warn('NavigationBar API não disponível no Expo Go');
      }
    };
    updateSystemBars();
  }, [isModalOpen]);

  const resetDraft = () => {
    setDraft({
      name: '',
      birthDate: '',
      birthPlace: '',
      relationship: '',
      guardianName: '',
      sex: '',
      photoUri: undefined,
      cns: '',
      zipCode: '',
      address: '',
      complement: '',
      city: '',
      state: '',
      phone: '',
    });
    setShowDatePicker(false);
    setShowRelationshipPicker(false);
    setShowStatePicker(false);
    setErrors({});
  };

  const openCreate = () => {
    resetDraft();
    modalScrollY.current = 0;
    setIsModalOpen(true);
  };

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

  const handlePickImage = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso para escolher a foto.');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });

    if (!result.canceled && result.assets.length > 0) {
      setDraft((current) => ({ ...current, photoUri: result.assets[0].uri }));
    }
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

  const fetchCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;

    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`).catch(() => null);
    if (!response?.ok) return;

    const data = await response.json().catch(() => null);
    if (!data || data.erro) return;

    setDraft((current) => ({
      ...current,
      ...(data.logradouro && { address: data.logradouro }),
      ...(data.localidade && { city: data.localidade }),
      ...(data.uf && { state: data.uf as EstadoUF }),
    }));
  };

  type DepFieldKey = 'name' | 'birthDate' | 'relationship' | 'sex' | 'zipCode' | 'phone';
  const [errors, setErrors] = useState<Partial<Record<DepFieldKey, string>>>({});
  const clearError = (field: DepFieldKey) =>
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

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
      name: nameInputRef,
      birthDate: birthDateRef,
      relationship: relationshipRef,
      sex: sexRef,
      zipCode: zipCodeRef,
      phone: phoneRef,
    };
    const ref = refMap[firstField];
    const scroll = modalScrollRef.current;
    if (!ref?.current || !scroll) return;
    setTimeout(() => {
      try {
        (ref.current as any).measure?.(
          (_x: number, _y: number, _w: number, h: number, _pageX: number, pageY: number) => {
            const screenHeight = Dimensions.get('window').height;
            const inputCenter = pageY + h / 2;
            const targetCenter = screenHeight / 2;
            const delta = inputCenter - targetCenter;
            scroll.scrollTo({
              y: Math.max(0, modalScrollY.current + delta),
              animated: true,
            });
          },
        );
      } catch {}
    }, 80);
  };

  const validateDraft = () => {
    const novoErros: Partial<Record<DepFieldKey, string>> = {};
    if (!draft.name.trim()) novoErros.name = 'Campo obrigatório!';
    if (!draft.birthDate.trim()) novoErros.birthDate = 'Campo obrigatório!';
    if (!draft.relationship.trim()) novoErros.relationship = 'Campo obrigatório!';
    if (!draft.sex) novoErros.sex = 'Campo obrigatório!';
    if (!draft.zipCode || draft.zipCode.replace(/\D/g, '').length !== 8) {
      novoErros.zipCode = 'Campo obrigatório!';
    }
    if (!draft.phone || !draft.phone.trim()) novoErros.phone = 'Campo obrigatório!';
    if (Object.keys(novoErros).length > 0) {
      setErrors(novoErros);
      scrollDepToFirstError(novoErros);
      return false;
    }
    setErrors({});
    return true;
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
                      <Avatar
                        name={dependent.name}
                        photoUri={dependent.photoUri}
                        size={44}
                        tone={tone}
                      />
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
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="settings-outline" size={18} color={colors.brand} />
              </View>
              <Text style={styles.menuLabel}>Configurações</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.ink4} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="help-circle-outline" size={18} color={colors.brand} />
              </View>
              <Text style={styles.menuLabel}>Ajuda</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.ink4} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.85}
          onPress={async () => {
            await logout();
            reset();
            router.replace('/login');
          }}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.coral} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>

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
                      onPress={() => setDraft((current) => ({ ...current, photoUri: undefined }))}
                    >
                      <Text style={[styles.photoButtonText, styles.photoButtonTextGhost]}>Remover</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Nome <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  ref={nameInputRef}
                  style={[styles.input, errors.name && styles.inputError]}
                  value={draft.name}
                  onChangeText={(value) => { setDraft((current) => ({ ...current, name: value })); clearError('name'); }}
                  placeholder="Nome completo"
                  placeholderTextColor={colors.ink4}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Nascimento <Text style={styles.required}>*</Text>
                </Text>
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
                        setDraft((current) => ({ ...current, birthDate: dateStr }));
                        clearError('birthDate');
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Parentesco <Text style={styles.required}>*</Text>
                </Text>
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
                          style={[
                            styles.pickerOption,
                            draft.relationship === option && styles.pickerOptionActive,
                          ]}
                          onPress={() => {
                            setDraft((current) => ({ ...current, relationship: option }));
                            setShowRelationshipPicker(false);
                            clearError('relationship');
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              draft.relationship === option && styles.pickerOptionTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                          {draft.relationship === option && (
                            <Ionicons name="checkmark" size={18} color={colors.brand} />
                          )}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Sexo <Text style={styles.required}>*</Text>
                </Text>
                <View ref={sexRef} style={styles.sexRow}>
                  {SEX_OPTIONS.map((option) => {
                    const isActive = draft.sex === option;
                    return (
                      <Pressable
                        key={option}
                        style={[
                          styles.sexChip,
                          isActive && styles.sexChipActive,
                          errors.sex && !isActive && styles.inputError,
                        ]}
                        onPress={() => {
                          setDraft((current) => ({ ...current, sex: option }));
                          clearError('sex');
                        }}
                      >
                        <Text style={[styles.sexChipText, isActive && styles.sexChipTextActive]}>
                          {option}
                        </Text>
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
                  onChangeText={(value) => setDraft((current) => ({ ...current, birthPlace: value }))}
                  placeholder="Ex: São Paulo - SP"
                  placeholderTextColor={colors.ink4}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CNS</Text>
                <TextInput
                  style={styles.input}
                  value={draft.cns}
                  onChangeText={(value) => setDraft((current) => ({ ...current, cns: formatCns(value) }))}
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
                  onChangeText={(value) => setDraft((current) => ({ ...current, guardianName: value }))}
                  placeholder="Nome do responsável"
                  placeholderTextColor={colors.ink4}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  CEP <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  ref={zipCodeRef}
                  style={[styles.input, errors.zipCode && styles.inputError]}
                  value={draft.zipCode}
                  onChangeText={(value) => {
                    setDraft((current) => ({ ...current, zipCode: formatCep(value) }));
                    clearError('zipCode');
                  }}
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
                  onChangeText={(value) => setDraft((current) => ({ ...current, address: value }))}
                  placeholder="Rua e número"
                  placeholderTextColor={colors.ink4}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Complemento</Text>
                <TextInput
                  style={styles.input}
                  value={draft.complement}
                  onChangeText={(value) => setDraft((current) => ({ ...current, complement: value }))}
                  placeholder="Apto, bloco, etc."
                  placeholderTextColor={colors.ink4}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Município</Text>
                <TextInput
                  style={styles.input}
                  value={draft.city}
                  onChangeText={(value) => setDraft((current) => ({ ...current, city: value }))}
                  placeholder="Nome da cidade"
                  placeholderTextColor={colors.ink4}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Estado</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowStatePicker(!showStatePicker)}
                >
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
                          onPress={() => {
                            setDraft((current) => ({ ...current, state: uf }));
                            setShowStatePicker(false);
                          }}
                        >
                          <Text style={[styles.pickerOptionText, draft.state === uf && styles.pickerOptionTextActive]}>
                            {uf}
                          </Text>
                          {draft.state === uf && <Ionicons name="checkmark" size={18} color={colors.brand} />}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Telefone <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  ref={phoneRef}
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={draft.phone}
                  onChangeText={(value) => {
                    setDraft((current) => ({ ...current, phone: formatPhone(value) }));
                    clearError('phone');
                  }}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={colors.ink4}
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

      <StatusBar style={isModalOpen ? 'light' : 'dark'} />
    </View>
  );
}
