import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, ScrollView, Image, Modal, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERTS_BY_PROFILE, APPLICATIONS, MAIN_USER } from './data/family';
import { Dependent, FamilyMember } from './types/vaccination';
import { getDependents } from '../src/storage/dependents';

const SELECTED_PROFILE_KEY = 'selectedProfileId';

export default function Index() {
  const router = useRouter();
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDependents = useCallback(async () => {
    const stored = await getDependents();
    setDependents(stored);
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
    }, [loadDependents])
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

  const selectedApplications = useMemo(
    () => APPLICATIONS.filter((item) => item.profileId === selectedProfile.id),
    [selectedProfile.id]
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
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Aplicadas</Text>
              <Text style={styles.summaryValue}>{appliedVaccines.length}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Pendentes</Text>
              <Text style={styles.summaryValue}>{pendingVaccines.length}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Próxima dose</Text>
              <Text style={styles.summaryText}>{nextVaccine?.vaccineName ?? 'Sem pendências'}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Alertas</Text>
              <Text style={styles.summaryValue}>{activeAlerts.length}</Text>
            </View>
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
                  <Text style={styles.listItemSubtitle}>Prevista: {item.dueDate ?? 'a definir'}</Text>
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

      <StatusBar style={isProfileModalOpen ? 'light' : 'dark'} />
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  summaryCard: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#5b6b60',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f3322',
  },
  summaryText: {
    fontSize: 13,
    color: '#1f3322',
    fontWeight: '600',
  },
  sectionBlock: {
    marginTop: 14,
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