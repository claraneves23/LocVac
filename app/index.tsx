import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, ScrollView, Image, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ALERTS_BY_PROFILE, APPLICATIONS, MAIN_USER } from './data/family';
import { Dependent, FamilyMember } from './types/vaccination';
import { getDependents } from '../src/storage/dependents';

export default function Index() {
  const router = useRouter();
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(MAIN_USER.id);

  const loadDependents = useCallback(async () => {
    const stored = await getDependents();
    setDependents(stored);
  }, []);

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

    return familyMembers.find((profile) => profile.id === selectedProfileId) ?? fallback;
  }, [familyMembers, selectedProfileId]);

  useFocusEffect(
    useCallback(() => {
      if (!familyMembers.some((profile) => profile.id === selectedProfileId)) {
        setSelectedProfileId(MAIN_USER.id);
      }
    }, [familyMembers, selectedProfileId])
  );

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
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.title}>
              <Text style={styles.titleLoc}>Loc</Text>
              <Text style={styles.titleVac}>Vac</Text>
            </Text>
            <Text style={styles.subtitle}>Resumo vacinal familiar</Text>
          </View>
        </View>
        <Pressable style={styles.profileSwitcher} onPress={() => setIsProfileModalOpen(true)}>
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>{selectedProfile.name.charAt(0)}</Text>
          </View>
          <Text style={styles.profileSwitcherText}>
            {selectedProfile.kind === 'user' ? 'Você' : selectedProfile.name}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#29442dff" />
        </Pressable>
      </View>

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

      <Modal
        visible={isProfileModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProfileModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsProfileModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => null}>
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
                    <Text style={styles.modalOptionBadgeText}>{profile.name.charAt(0)}</Text>
                  </View>
                  <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextActive]}>
                    {profile.kind === 'user' ? 'Você' : profile.name}
                  </Text>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      <StatusBar style="auto" />
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
    paddingHorizontal: 16,
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
    gap: 10,
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
  profileSwitcherText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f3322',
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
});
