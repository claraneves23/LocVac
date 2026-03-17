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
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as NavigationBar from 'expo-navigation-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MAIN_USER } from './data/family';
import { Dependent } from './types/vaccination';
import { getDependents, addDependent, updateDependent, removeDependent } from '../src/storage/dependents';
import { logout } from './service/authService';

const SEX_OPTIONS: Dependent['sex'][] = ['M', 'F', 'Outro'];
const RELATIONSHIP_OPTIONS = ['Filho', 'Filha', 'Neto', 'Neta', 'Sobrinho', 'Sobrinha', 'Irmão', 'Irmã', 'Outro'];

type DraftDependent = Omit<Dependent, 'id' | 'userId'> & { id?: string };

export default function User() {
  const router = useRouter();
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);
  const [draft, setDraft] = useState<DraftDependent>({
    name: '',
    birthDate: '',
    birthPlace: '',
    relationship: '',
    guardianName: '',
    sex: 'M',
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

  const loadDependents = useCallback(async () => {
    const stored = await getDependents();
    setDependents(stored);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDependents();
    }, [loadDependents])
  );

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
      sex: 'M',
      photoUri: undefined,
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
    });
    setShowDatePicker(false);
    setShowRelationshipPicker(false);
  };

  const openCreate = () => {
    resetDraft();
    setIsModalOpen(true);
  };

  const openEdit = (dependent: Dependent) => {
    setDraft({
      id: dependent.id,
      name: dependent.name,
      birthDate: dependent.birthDate,
      birthPlace: dependent.birthPlace || '',
      relationship: dependent.relationship,
      guardianName: dependent.guardianName || '',
      sex: dependent.sex,
      photoUri: dependent.photoUri,
      address: dependent.address || '',
      city: dependent.city || '',
      state: dependent.state || '',
      zipCode: dependent.zipCode || '',
      phone: dependent.phone || '',
    });
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
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
        });

    if (!result.canceled && result.assets.length > 0) {
      setDraft((current) => ({ ...current, photoUri: result.assets[0].uri }));
    }
  };

  const validateDraft = () => {
    if (!draft.name.trim() || !draft.birthDate.trim() || !draft.relationship.trim()) {
      Alert.alert('Campos obrigatorios', 'Preencha nome, nascimento e parentesco.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateDraft()) {
      return;
    }

    if (draft.id) {
      const updated = await updateDependent({
        id: draft.id,
        userId: MAIN_USER.id,
        name: draft.name.trim(),
        birthDate: draft.birthDate.trim(),
        birthPlace: draft.birthPlace?.trim() || undefined,
        relationship: draft.relationship.trim(),
        guardianName: draft.guardianName?.trim() || undefined,
        sex: draft.sex,
        photoUri: draft.photoUri,
        address: draft.address?.trim() || undefined,
        city: draft.city?.trim() || undefined,
        state: draft.state?.trim() || undefined,
        zipCode: draft.zipCode?.trim() || undefined,
        phone: draft.phone?.trim() || undefined,
      });
      setDependents(updated);
    } else {
      const newDependent: Dependent = {
        id: `dep-${Date.now()}`,
        userId: MAIN_USER.id,
        name: draft.name.trim(),
        birthDate: draft.birthDate.trim(),
        birthPlace: draft.birthPlace?.trim() || undefined,
        relationship: draft.relationship.trim(),
        guardianName: draft.guardianName?.trim() || undefined,
        sex: draft.sex,
        photoUri: draft.photoUri,
        address: draft.address?.trim() || undefined,
        city: draft.city?.trim() || undefined,
        state: draft.state?.trim() || undefined,
        zipCode: draft.zipCode?.trim() || undefined,
        phone: draft.phone?.trim() || undefined,
      };
      const updated = await addDependent(newDependent);
      setDependents(updated);
    }

    setIsModalOpen(false);
    resetDraft();
  };

  const handleRemove = (dependent: Dependent) => {
    Alert.alert('Remover dependente?', `Deseja remover ${dependent.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const updated = await removeDependent(dependent.id);
          setDependents(updated);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          <View style={styles.photo}>
            <Text style={styles.photoInitial}>{MAIN_USER.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.name}>{MAIN_USER.name}</Text>
            <Text style={styles.subtitle}>Titular da conta</Text>
            <Text style={styles.subtitle}>{MAIN_USER.email}</Text>
          </View>
        </View>

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
              {dependents.map((dependent) => (
                <View key={dependent.id} style={styles.dependentCard}>
                  <View style={styles.dependentRow}>
                    {dependent.photoUri ? (
                      <Image source={{ uri: dependent.photoUri }} style={styles.dependentAvatar} />
                    ) : (
                      <View style={styles.dependentAvatarPlaceholder}>
                        <Text style={styles.dependentAvatarInitial}>{dependent.name.charAt(0)}</Text>
                      </View>
                    )}
                    <View style={styles.dependentInfo}>
                      <Text style={styles.dependentName}>{dependent.name}</Text>
                      <Text style={styles.dependentMeta}>
                        {dependent.relationship} • {formatDateToBR(dependent.birthDate)} • {dependent.sex}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.dependentActions}>
                    <TouchableOpacity style={styles.dependentActionButton} onPress={() => openEdit(dependent)}>
                      <Ionicons name="pencil" size={16} color="#29442dff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dependentActionButton} onPress={() => handleRemove(dependent)}>
                      <Ionicons name="trash" size={16} color="#d32f2f" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
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

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
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
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={styles.input}
                  value={draft.name}
                  onChangeText={(value) => setDraft((current) => ({ ...current, name: value }))}
                  placeholder="Nome completo"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nascimento</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={draft.birthDate ? styles.dateButtonTextFilled : styles.dateButtonText}>
                    {draft.birthDate ? formatDateToBR(draft.birthDate) : 'Selecionar data'}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color="#29442dff" />
                </Pressable>
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
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Parentesco</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowRelationshipPicker(!showRelationshipPicker)}
                >
                  <Text style={draft.relationship ? styles.dateButtonTextFilled : styles.dateButtonText}>
                    {draft.relationship || 'Selecionar parentesco'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#29442dff" />
                </Pressable>
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
                <Text style={styles.label}>Sexo</Text>
                <View style={styles.sexRow}>
                  {SEX_OPTIONS.map((option) => {
                    const isActive = draft.sex === option;
                    return (
                      <Pressable
                        key={option}
                        style={[styles.sexChip, isActive && styles.sexChipActive]}
                        onPress={() => setDraft((current) => ({ ...current, sex: option }))}
                      >
                        <Text style={[styles.sexChipText, isActive && styles.sexChipTextActive]}>
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
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
                <Text style={styles.label}>Nome da Mãe ou Responsável</Text>
                <TextInput
                  style={styles.input}
                  value={draft.guardianName}
                  onChangeText={(value) => setDraft((current) => ({ ...current, guardianName: value }))}
                  placeholder="Nome do responsável"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Endereço</Text>
                <TextInput
                  style={styles.input}
                  value={draft.address}
                  onChangeText={(value) => setDraft((current) => ({ ...current, address: value }))}
                  placeholder="Rua, número, complemento"
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
                <TextInput
                  style={styles.input}
                  value={draft.state}
                  onChangeText={(value) => setDraft((current) => ({ ...current, state: value }))}
                  placeholder="Ex: SP"
                  maxLength={2}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CEP</Text>
                <TextInput
                  style={styles.input}
                  value={draft.zipCode}
                  onChangeText={(value) => setDraft((current) => ({ ...current, zipCode: value }))}
                  placeholder="00000-000"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  value={draft.phone}
                  onChangeText={(value) => setDraft((current) => ({ ...current, phone: value }))}
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setIsModalOpen(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
});
