import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { BottomBar } from '../components/BottomBar';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Search() {
  const [searchText, setSearchText] = useState('');
  const [searchHistory, setSearchHistory] = useState<Array<{ text: string; filter: 'todos' | 'dependente' | 'vacina' | 'calendario' }>>([]);
  const [filter, setFilter] = useState<'todos' | 'dependente' | 'vacina' | 'calendario'>('todos');

  const getFilterIcon = (filterType: 'todos' | 'dependente' | 'vacina' | 'calendario') => {
    switch (filterType) {
      case 'todos':
        return 'medical';
      case 'dependente':
        return 'people';
      case 'vacina':
        return 'medkit';
      case 'calendario':
        return 'medkit';
      default:
        return 'medical';
    }
  };

  const handleSearch = () => {
    if (searchText.trim() !== '') {
      setSearchHistory([{ text: searchText, filter }, ...searchHistory]);
      setSearchText('');
    }
  };

  const handleRemoveHistory = (index: number) => {
    const newHistory = searchHistory.filter((_, i) => i !== index);
    setSearchHistory(newHistory);
  };

  return (
    <View style={styles.container}>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquise por dependente, vacina ou calendário..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'todos' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('todos')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'todos' && styles.filterButtonTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'dependente' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('dependente')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'dependente' && styles.filterButtonTextActive,
            ]}
          >
            Dependente
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'vacina' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('vacina')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'vacina' && styles.filterButtonTextActive,
            ]}
          >
            Vacina
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'calendario' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('calendario')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'calendario' && styles.filterButtonTextActive,
            ]}
          >
            Calendário
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={styles.restTitle}>Resultados rápidos</Text>
      </View>

      {searchHistory.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Histórico de Pesquisas</Text>
          </View>

          <FlatList
            data={searchHistory}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.historyItem}
                onPress={() => setSearchText(item.text)}
              >
                <Ionicons
                  name={getFilterIcon(item.filter)}
                  size={18}
                  color="#666"
                  style={styles.historyIcon}
                />
                <Text style={styles.historyText}>{item.text}</Text>
                <TouchableOpacity onPress={() => handleRemoveHistory(index)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>
      )}

      <BottomBar />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAE3E2',
    paddingTop: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: '10%',
    alignItems: 'center',
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    paddingVertical: 4,
    gap: 8,
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  filterButtonActive: {
    backgroundColor: '#3E4E3F',
    borderColor: '#2C2C2C',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#1E1E1E',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  restTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C271F',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  historySection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C271F',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  historyIcon: {
    marginRight: 12,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    fontSize: 18,
    color: '#666',
    marginLeft: 12,
  },
});