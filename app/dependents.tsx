import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MAIN_USER } from './data/family';
import { Dependent } from './types/vaccination';
import { addDependent, getDependents, removeDependent, updateDependent } from '../src/storage/dependents';

const SEX_OPTIONS: Dependent['sex'][] = ['M', 'F', 'Outro'];

type DraftDependent = Omit<Dependent, 'id' | 'userId'> & { id?: string };

export default function Dependents() {
  const navigation = useNavigation();
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<DraftDependent>({
    name: '',
    birthDate: '',
    relationship: '',
    sex: 'M',
    photoUri: undefined,
  });

  const loadDependents = useCallback(async () => {
    const stored = await getDependents();
    setDependents(stored);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDependents();
    }, [loadDependents])
  );

  const resetDraft = () => {
    setDraft({
      name: '',
      birthDate: '',
      relationship: '',
      sex: 'M',
      photoUri: undefined,
    });
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
      relationship: dependent.relationship,
      sex: dependent.sex,
      photoUri: dependent.photoUri,
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
        relationship: draft.relationship.trim(),
        sex: draft.sex,
        photoUri: draft.photoUri,
      });
      setDependents(updated);
    } else {
      const newDependent: Dependent = {
        id: `dep-${Date.now()}`,
        userId: MAIN_USER.id,
        name: draft.name.trim(),
        birthDate: draft.birthDate.trim(),
        relationship: draft.relationship.trim(),
        sex: draft.sex,
        photoUri: draft.photoUri,
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
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#29442dff" />
        </Pressable>
        <Text style={styles.title}>Dependentes</Text>
        <Pressable onPress={openCreate} style={styles.addButton}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Adicionar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {dependents.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum dependente cadastrado.</Text>
        ) : (
          dependents.map((dependent) => (
            <View key={dependent.id} style={styles.card}>
              <View style={styles.cardRow}>
                {dependent.photoUri ? (
                  <Image source={{ uri: dependent.photoUri }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{dependent.name.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{dependent.name}</Text>
                  <Text style={styles.cardMeta}>
                    {dependent.relationship} • {dependent.birthDate} • {dependent.sex}
                  </Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <Pressable style={styles.actionButton} onPress={() => openEdit(dependent)}>
                  <Text style={styles.actionButtonText}>Editar</Text>
                </Pressable>
                <Pressable style={styles.actionButton} onPress={() => handleRemove(dependent)}>
                  <Text style={styles.actionButtonText}>Remover</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal transparent visible={isModalOpen} animationType="fade" onRequestClose={() => setIsModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => null}>
            <Text style={styles.modalTitle}>
              {draft.id ? 'Editar dependente' : 'Novo dependente'}
            </Text>

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
              <TextInput
                style={styles.input}
                value={draft.birthDate}
                onChangeText={(value) => setDraft((current) => ({ ...current, birthDate: value }))}
                placeholder="AAAA-MM-DD"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Parentesco</Text>
              <TextInput
                style={styles.input}
                value={draft.relationship}
                onChangeText={(value) => setDraft((current) => ({ ...current, relationship: value }))}
                placeholder="Filho, Filha, Neto..."
              />
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

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setIsModalOpen(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAE3E2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CAE3E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f3322',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#29442dff',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#607367',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#B0D5D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#29442dff',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f3322',
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#607367',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#29442d55',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#29442dff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f3322',
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
    gap: 6,
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
