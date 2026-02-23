import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { APPLICATIONS, DEPENDENTS, MAIN_USER } from './data/family';

export default function User() {
  const myVaccines = APPLICATIONS.filter((item) => item.profileId === MAIN_USER.id);
  const myApplied = myVaccines.filter((item) => item.status === 'applied').length;
  const myPending = myVaccines.filter((item) => item.status === 'pending' || item.status === 'overdue').length;

  return (
    <View style={styles.container}>
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

      <ScrollView style={styles.optionsContainer}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Minhas Vacinas</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Aplicadas</Text>
              <Text style={styles.summaryValue}>{myApplied}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pendentes</Text>
              <Text style={styles.summaryValue}>{myPending}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gerenciar Dependentes</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {DEPENDENTS.map((dependent) => (
            <View key={dependent.id} style={styles.dependentItem}>
              <View style={styles.dependentIdentity}>
                <View style={styles.dependentAvatar}>
                  <Text style={styles.dependentInitial}>{dependent.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.dependentName}>{dependent.name}</Text>
                  <Text style={styles.dependentMeta}>{dependent.relationship} • {dependent.birthDate}</Text>
                </View>
              </View>

              <View style={styles.dependentActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
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
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#607367',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f3322',
  },
  dependentItem: {
    paddingVertical: 10,
    borderBottomWidth: 0.4,
    borderBottomColor: '#6666662d',
  },
  dependentIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dependentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#B0D5D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dependentInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#29442dff',
  },
  dependentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f3322',
  },
  dependentMeta: {
    fontSize: 12,
    color: '#607367',
  },
  dependentActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginLeft: 44,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#29442d55',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#29442dff',
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomEndRadius: 0.2,
    borderBottomWidth: 0.4,
    borderBottomColor: '#6666662d',
  },
  optionNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  icon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});