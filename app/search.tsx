import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Search() {
  const [searchText, setSearchText] = useState('');
  const [searchHistory, setSearchHistory] = useState<Array<{ text: string }>>([]);

  const handleSearch = () => {
    if (searchText.trim() !== '') {
      setSearchHistory([{ text: searchText }, ...searchHistory]);
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
            placeholder="Pesquise por vacina..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      <View>
        <Text style={styles.restTitle}>Imunizações restantes</Text>
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
                <MaterialIcons
                  name="vaccines"
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
    paddingTop: '15%',
    paddingBottom: 15,
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