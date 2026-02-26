import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, ScrollView, Image, Modal, Platform, TextInput, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ALERTS_BY_PROFILE, MAIN_USER } from './data/family';
import { Dependent, FamilyMember, VaccineApplication } from './types/vaccination';
import { getDependents } from '../src/storage/dependents';
import { getVaccines, addVaccine, updateVaccine, deleteVaccine } from '../src/storage/vaccines';

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
  
  // Estados para o formulário de adicionar vacina
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newVaccineDate, setNewVaccineDate] = useState('');
  const [newVaccineLot, setNewVaccineLot] = useState('');
  const [newVaccineHealthUnit, setNewVaccineHealthUnit] = useState('');
  const [newVaccineNotes, setNewVaccineNotes] = useState('');

  const loadDependents = useCallback(async () => {
    const stored = await getDependents();
    setDependents(stored);
  }, []);

  const loadVaccines = useCallback(async () => {
    const stored = await getVaccines();
    setVaccines(stored);
  }, []);

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
    }, [loadDependents, loadVaccines])
  );

  const familyMembers = useMemo<FamilyMember[]>(
    () => [
      {
        id: MAIN_USER.id,
        userId: MAIN_USER.id,
        name: MAIN_USER.name,
        birthDate: MAIN_USER.birthDate,
        sex: MAIN_USER.sex,
        kind: 'user',
      },
      ...dependents.map((dependent) => ({
        id: dependent.id,
        userId: dependent.userId,
        name: dependent.name,
        birthDate: dependent.birthDate,
        sex: dependent.sex,
        kind: 'dependent' as const,
        relationship: dependent.relationship,
        photoUri: dependent.photoUri,
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
      sex: MAIN_USER.sex,
      kind: 'user',
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
        <Pressable style={styles.profileSwitcher} onPress={() => setIsProfileModalOpen(true)}>
          <View style={styles.profileBadge}>
            {selectedProfile.photoUri ? (
              <Image source={{ uri: selectedProfile.photoUri }} style={styles.profileBadgeImage} />
            ) : (
              <Text style={styles.profileBadgeText}>{selectedProfile.name.charAt(0)}</Text>
            )}
          </View>
          <Ionicons name="chevron-down" size={16} color="#29442dff" />
        </Pressable>
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
              <View style={styles.cardProfileBadge}>
                {selectedProfile.photoUri ? (
                  <Image source={{ uri: selectedProfile.photoUri }} style={styles.cardProfileImage} />
                ) : (
                  <Text style={styles.cardProfileText}>{selectedProfile.name.charAt(0)}</Text>
                )}
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardBody}>
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoLabel}>Nome</Text>
                <Text style={styles.cardInfoValue}>{selectedProfile.name}</Text>
              </View>
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoLabel}>Data de Nascimento</Text>
                <Text style={styles.cardInfoValue}>{formatDateToBR(selectedProfile.birthDate)}</Text>
              </View>
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfoLabel}>Sexo</Text>
                <Text style={styles.cardInfoValue}>
                  {selectedProfile.sex === 'M' ? 'Masculino' : 'Feminino'}
                </Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardFooter}>
              <View style={styles.cardStat}>
                <Text style={styles.cardStatValue}>{appliedVaccines.length}</Text>
                <Text style={styles.cardStatLabel}>Aplicadas</Text>
              </View>
              <View style={styles.cardStatDivider} />
              <View style={styles.cardStat}>
                <Text style={styles.cardStatValue}>{pendingVaccines.length}</Text>
                <Text style={styles.cardStatLabel}>Pendentes</Text>
              </View>
              <View style={styles.cardStatDivider} />
              <View style={styles.cardStat}>
                <Text style={styles.cardStatValue}>{activeAlerts.length}</Text>
                <Text style={styles.cardStatLabel}>Alertas</Text>
              </View>
            </View>

            {nextVaccine && (
              <>
                <View style={styles.cardDivider} />
                <View style={styles.cardNextVaccine}>
                  <Ionicons name="time-outline" size={18} color="#09BEA5" />
                  <View style={styles.cardNextVaccineInfo}>
                    <Text style={styles.cardNextVaccineLabel}>Próxima dose</Text>
                    <Text style={styles.cardNextVaccineValue}>{nextVaccine.vaccineName}</Text>
                    <Text style={styles.cardNextVaccineDate}>Prevista: {formatDateToBR(nextVaccine.dueDate)}</Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.cardDivider} />
            
            <Pressable style={styles.addVaccineButton} onPress={openAddVaccineModal}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.addVaccineButtonText}>Registrar Vacina</Text>
            </Pressable>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Histórico de Vacinas</Text>
            {appliedVaccines.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma vacina registrada ainda.</Text>
            ) : (
              appliedVaccines.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyItemHeader}>
                    <Ionicons name="checkmark-circle" size={20} color="#09BEA5" />
                    <Text style={styles.historyItemTitle}>{item.vaccineName}</Text>
                    <View style={styles.historyItemActions}>
                      <Pressable 
                        style={styles.historyActionButton}
                        onPress={() => openEditVaccineModal(item)}
                      >
                        <Ionicons name="create-outline" size={18} color="#005570" />
                      </Pressable>
                      <Pressable 
                        style={styles.historyActionButton}
                        onPress={() => {
                          Alert.alert(
                            'Excluir Vacina',
                            'Deseja realmente excluir esta vacina?',
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { 
                                text: 'Excluir', 
                                style: 'destructive',
                                onPress: () => handleDeleteVaccine(item.id)
                              }
                            ]
                          );
                        }}
                      >
                        <Ionicons name="trash-outline" size={18} color="#dc2626" />
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.historyItemDetails}>
                    {item.applicationDate && (
                      <Text style={styles.historyItemDetail}>
                        <Text style={styles.historyItemDetailLabel}>Data: </Text>
                        {formatDateToBR(item.applicationDate)}
                      </Text>
                    )}
                    {item.lot && (
                      <Text style={styles.historyItemDetail}>
                        <Text style={styles.historyItemDetailLabel}>Lote: </Text>
                        {item.lot}
                      </Text>
                    )}
                    {item.healthUnit && (
                      <Text style={styles.historyItemDetail}>
                        <Text style={styles.historyItemDetailLabel}>Local: </Text>
                        {item.healthUnit}
                      </Text>
                    )}
                    {item.notes && (
                      <Text style={styles.historyItemDetail}>
                        <Text style={styles.historyItemDetailLabel}>Obs: </Text>
                        {item.notes}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Vacinas pendentes</Text>
            {pendingVaccines.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma vacina pendente para este perfil.</Text>
            ) : (
              pendingVaccines.map((item) => (
              <Pressable
                key={item.id}
                style={styles.listItem}
                onPress={() =>
                  router.push({
                    pathname: '/location-details',
                    params: { profile: JSON.stringify(selectedProfile) },
                  })
                }
              >
                <View>
                  <Text style={styles.listItemTitle}>{item.vaccineName}</Text>
                  <Text style={styles.listItemSubtitle}>Prevista: {item.dueDate ? formatDateToBR(item.dueDate) : 'a definir'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#29442dff" />
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Alertas ativos</Text>
          {activeAlerts.length === 0 ? (
            <Text style={styles.emptyText}>Sem alertas no momento.</Text>
          ) : (
            activeAlerts.map((alertMessage, index) => (
              <View key={`${selectedProfile.id}-${index}`} style={styles.alertItem}>
                <Ionicons name="alert-circle-outline" size={18} color="#29442dff" />
                <Text style={styles.alertText}>{alertMessage}</Text>
              </View>
            ))
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
          <Pressable style={styles.addVaccineModal} onPress={(e) => e.stopPropagation()}>
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
            </ScrollView>
          </Pressable>
        </View>
      </Modal>

      <StatusBar style={isProfileModalOpen || isAddVaccineModalOpen ? 'light' : 'dark'} />
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
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
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
    fontWeight: '700',
    color: '#1f3322',
    marginBottom: 8,
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
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  formScroll: {
    marginTop: 8,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f3322',
    marginBottom: 6,
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
  },});