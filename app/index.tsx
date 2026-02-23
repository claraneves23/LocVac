import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, Pressable, ScrollView, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ALERTS_BY_PROFILE, APPLICATIONS, FAMILY_MEMBERS } from './data/family';

export default function Index() {
  const router = useRouter();
  const [selectedProfileId, setSelectedProfileId] = useState<string>(FAMILY_MEMBERS[0].id);

  const selectedProfile = useMemo(
    () => FAMILY_MEMBERS.find((profile) => profile.id === selectedProfileId) ?? FAMILY_MEMBERS[0],
    [selectedProfileId]
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
        <Ionicons
          name="notifications-outline"
          size={24}
          color="#000000ff"
          style={styles.notificationsIcon}
        />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Perfis</Text>
        <FlatList
          horizontal
          data={FAMILY_MEMBERS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dependentList}
          renderItem={({ item }) => {
            const isSelected = selectedProfileId === item.id;
            return (
              <Pressable
                style={[styles.dependentChip, isSelected && styles.dependentChipActive]}
                onPress={() => setSelectedProfileId(item.id)}
              >
                <Text style={[styles.dependentChipText, isSelected && styles.dependentChipTextActive]}>
                  {item.kind === 'user' ? 'Você' : item.name}
                </Text>
              </Pressable>
            );
          }}
        />

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
    paddingTop: '13%',
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
  notificationsIcon: {
    backgroundColor: '#CAE3E2',
    borderRadius: 16,
    padding: 4,
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
  dependentList: {
    paddingBottom: 4,
    gap: 8,
  },
  dependentChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#B8DCD9',
    borderRadius: 20,
  },
  dependentChipActive: {
    backgroundColor: '#29442dff',
  },
  dependentChipText: {
    fontSize: 13,
    color: '#1f3322',
    fontWeight: '500',
  },
  dependentChipTextActive: {
    color: '#fff',
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
