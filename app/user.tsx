import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomBar } from '../components/BottomBar';

export default function User() {
  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <View style={styles.photo}>
          {/* Placeholder for photo */}
        </View>
        <Text style={styles.name}>Nome do Usuário</Text>
      </View>
      <ScrollView style={styles.optionsContainer}>
        <View style={styles.firstOptionsView}>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="people" size={24} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>Dependentes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="document-text" size={24} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>Dados</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="medkit" size={24} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>Registro Vacinal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="notifications" size={24} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>Notificações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="time" size={24} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>Histórico</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="location" size={24} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>Endereços</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="calendar" size={24} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>Calendário</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionNoBorder}>
            <Ionicons name="bookmark" size={24} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>Favoritos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.secondOptionsView}>
          <TouchableOpacity style={styles.optionNoBorder}>
            <Ionicons name="settings" size={24} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>Configurações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionNoBorder}>
            <Ionicons name="help-circle" size={24} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>Ajuda</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomBar />
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
    backgroundColor: '#ccc', // Placeholder color
    marginRight: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  firstOptionsView: {
    paddingLeft: 10,
  },
  secondOptionsView: {
    paddingTop: 6,
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