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
import { logout } from './service/authService';
import { FamilyMember } from './types/vaccination';
import { addDependentAndLink, updateDependent, deleteDependent } from './service/dependentsService';
import { useAppContext } from './context/AppContext';
import DependentInfoModal from '../components/modals/DependentInfoModal';

const SEX_OPTIONS = ['M', 'F'] as const;
const RELATIONSHIP_OPTIONS = ['Filho', 'Filha', 'Neto', 'Neta', 'Sobrinho', 'Sobrinha', 'Irmão', 'Irmã', 'Outro'];
const ESTADO_OPTIONS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'] as const;
type EstadoUF = typeof ESTADO_OPTIONS[number];

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

  // Funções para conversão de formato de data
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
        console.log('NavigationBar API não disponível no Expo Go');
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
      Alert.alert('Permissao necessaria', 'Autorize o acesso para escolher a foto.');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.7,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.7,
        });

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
      console.log('Erro ao salvar dependente:', e?.response?.data || e);
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
              console.log('Erro ao remover dependente:', e);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        {mainUser && (
          <View style={styles.profile}>
            <View style={styles.photo}>
              <Text style={styles.photoInitial}>{mainUser.name ? mainUser.name.charAt(0) : ''}</Text>
            </View>
            <View>
              <Text style={styles.name}>{mainUser.name}</Text>
              <Text style={styles.subtitle}>Titular da conta</Text>
              <Text style={styles.subtitle}>{mainUser.email}</Text>
            </View>
          </View>
        )}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gerenciar Dependentes</Text>
            <TouchableOpacity style={styles.addButton} onPress={openCreate}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
          
          {dependents.length === 0 ? (
            <Text style={styles.dependentSummary}>Nenhum dependente cadastrado.</Text>
          ) : (
            <View style={styles.dependentsList}>
              {dependents.map((dependent) => {
                console.log('DEBUG dependente:', {
                  id: dependent.id,
                  name: dependent.name,
                  relationship: dependent.relationship,
                  kind: dependent.kind
                });
                return (
                  <View key={dependent.id} style={styles.dependentCard}>
                    <Pressable style={styles.dependentRow} onPress={() => setSelectedDependent(dependent)}>
                      {dependent.photoUri ? (
                        <Image source={{ uri: dependent.photoUri }} style={styles.dependentAvatar} />
                      ) : (
                        <View style={styles.dependentAvatarPlaceholder}>
                          <Text style={styles.dependentAvatarInitial}>{dependent.name ? dependent.name.charAt(0) : ''}</Text>
                        </View>
                      )}
                      <View style={styles.dependentInfo}>
                        <Text style={styles.dependentName}>{dependent.name}</Text>
                        <Text style={styles.dependentMeta}>
                          {dependent.relationship || dependent.kind} • {formatDateToBR(dependent.birthDate)} • {dependent.sex}
                        </Text>
                      </View>
                    </Pressable>
                    <View style={styles.dependentActions}>
                      <Pressable style={styles.dependentActionButton} onPress={() => openEdit(dependent)}>
                        <Ionicons name="create-outline" size={20} color="#09BEA5" />
                      </Pressable>
                      <Pressable style={styles.dependentActionButton} onPress={() => handleRemove(dependent)}>
                        <Ionicons name="trash-outline" size={20} color="#e53935" />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="settings" size={24} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>Configurações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionNoBorder}>
            <Ionicons name="help-circle" size={24} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>Ajuda</Text>
          </TouchableOpacity>
        </View>

        {/* Botão de logout */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={[styles.option, { justifyContent: 'center', backgroundColor: '#ef4444', borderRadius: 8, marginTop: 12 }]}
            onPress={async () => {
              await logout();
              reset();
              router.replace('/login');
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" style={styles.icon} />
            <Text style={[styles.optionText, { color: '#fff' }]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setIsModalOpen(false)}
      >
        <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.5)" translucent />
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsModalOpen(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {draft.id ? 'Editar dependente' : 'Novo dependente'}
            </Text>
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
                    <Ionicons name="person" size={22} color="#29442dff" />
                  </View>
                )}
                <View style={styles.photoActions}>
                  <Pressable style={styles.photoButton} onPress={() => handlePickImage(false)}>
                    <Text style={styles.photoButtonText}>Galeria</Text>
                  </Pressable>
                  <Pressable style={styles.photoButton} onPress={() => handlePickImage(true)}>
                    <Text style={styles.photoButtonText}>Camera</Text>
                  </Pressable>
                  {draft.photoUri ? (
                    <Pressable
                      style={[styles.photoButton, styles.photoButtonGhost]}
                      onPress={() => setDraft((current) => ({ ...current, photoUri: undefined }))}
                    >
                      <Text style={styles.photoButtonText}>Remover</Text>
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
                  <Ionicons name="calendar-outline" size={18} color="#29442dff" />
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
                  <Ionicons name="chevron-down" size={18} color="#29442dff" />
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
                            <Ionicons name="checkmark" size={18} color="#29442dff" />
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
                <Text style={styles.label}>Local de Nascimento</Text>
                <TextInput
                  style={styles.input}
                  value={draft.birthPlace}
                  onChangeText={(value) => setDraft((current) => ({ ...current, birthPlace: value }))}
                  placeholder="Ex: São Paulo - SP"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CNS</Text>
                <TextInput
                  style={styles.input}
                  value={draft.cns}
                  onChangeText={(value) => setDraft((current) => ({ ...current, cns: formatCns(value) }))}
                  placeholder="000 0000 0000 0000"
                  keyboardType="numeric"
                  maxLength={18}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome da Mãe ou Responsável</Text>
                <TextInput
                  style={styles.input}
                  value={draft.guardianName}
                  onChangeText={(value) => setDraft((current) => ({ ...current, guardianName: value }))}
                  placeholder="Nome do responsável"
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
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Complemento</Text>
                <TextInput
                  style={styles.input}
                  value={draft.complement}
                  onChangeText={(value) => setDraft((current) => ({ ...current, complement: value }))}
                  placeholder="Apto, bloco, etc."
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Município</Text>
                <TextInput
                  style={styles.input}
                  value={draft.city}
                  onChangeText={(value) => setDraft((current) => ({ ...current, city: value }))}
                  placeholder="Nome da cidade"
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
                  <Ionicons name="chevron-down" size={18} color="#29442dff" />
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
                          {draft.state === uf && <Ionicons name="checkmark" size={18} color="#29442dff" />}
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
                  <ActivityIndicator color="#fff" size="small" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAE3E2',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#B0D5D3',
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitial: {
    fontSize: 28,
    color: '#29442dff',
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#4d5c53',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  sectionCard: {
    backgroundColor: '#ffffffcc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f3322',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#29442dff',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },

  dependentSummary: {
    fontSize: 13,
    color: '#607367',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomEndRadius: 0.2,
    borderBottomWidth: 0.4,
    borderBottomColor: '#6666662d',
  },
  optionNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  icon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  dependentsList: {
    gap: 8,
    marginTop: 10,
  },
  dependentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dependentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dependentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dependentAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#B0D5D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dependentAvatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#29442dff',
  },
  dependentInfo: {
    flex: 1,
  },
  dependentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f3322',
  },
  dependentMeta: {
    marginTop: 2,
    fontSize: 11,
    color: '#607367',
  },
  dependentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  dependentActionButton: {
    padding: 6,
  },
  editIconButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    flexDirection: 'column',
  },
  modalScroll: {
    maxHeight: '100%',
    marginVertical: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f3322',
    marginBottom: 4,
  },
  legend: {
    fontSize: 11,
    color: '#607367',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  required: {
    color: '#e53935',
    fontWeight: '700',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#e53935',
    backgroundColor: '#fdecea',
  },
  errorText: {
    fontSize: 11,
    color: '#e53935',
    marginTop: 4,
    fontWeight: '500',
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photoPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6F2F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#29442dff',
  },
  photoButtonGhost: {
    backgroundColor: '#B0D5D3',
  },
  photoButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  fieldGroup: {
    gap: 4,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f3322',
  },
  input: {
    backgroundColor: '#F2F7F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1f3322',
  },
  sexRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sexChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F2F7F6',
  },
  sexChipActive: {
    backgroundColor: '#29442dff',
  },
  sexChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f3322',
  },
  sexChipTextActive: {
    color: '#fff',
  },
  dateButton: {
    backgroundColor: '#F2F7F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonText: {
    fontSize: 13,
    color: '#999',
  },
  dateButtonTextFilled: {
    fontSize: 13,
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#29442d55',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#29442dff',
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#29442dff',
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
