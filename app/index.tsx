import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, Pressable, Modal, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { BottomBar } from '../components/BottomBar';
import  LocCards  from '../components/LocCards';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCS = [
  { id: '1', name: 'Posto Central', distance: '200 m', image: 'https://tse1.mm.bing.net/th/id/OIP.aJwjusPtJ70t1a8u_OqWbAHaFR?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3', isFavorited: false },
  { id: '2', name: 'Clínica Saúde', distance: '450 m', image: 'https://tse4.mm.bing.net/th/id/OIP.5oCj3WxYBbbWL9YgJRfV-wHaE7?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3', isFavorited: true },
  { id: '3', name: 'UBS Bairro', distance: '1.2 km', image: 'https://th.bing.com/th/id/R.2c19e87d686eee5f84b0a870d0d26156?rik=zQWGS6RK9ujgDA&riu=http%3a%2f%2fimprensaabc.com.br%2fwp-content%2fuploads%2f2020%2f01%2fpoliclinica.jpg&ehk=9gfSVzNuHcqfHubIqY0EJsAQdFsyFGRTCpfIp0dLKdM%3d&risl=&pid=ImgRaw&r=0' },
  { id: '4', name: 'Posto Norte', distance: '2.1 km', image: 'https://agenciapara.com.br/midias/2022/grandes/14600_ba8ec7a3-cc11-228c-0c1c-bd61ce0a31ad.jpg' },
  { id: '5', name: 'Unidade Sul', distance: '3.3 km', image: 'https://tse3.mm.bing.net/th/id/OIP.wKS0ibSloS9QnslCjCOSeAHaE8?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3' },
];

const ADDRESSES = [
  { id: '1', name: 'São Paulo, SP' },
  { id: '2', name: 'Brasília, DF' },
  { id: '3', name: 'Rio de Janeiro, RJ' },
  { id: '4', name: 'Salvador, BA' },
  { id: '5', name: 'Recife, PE' },
];

export default function Index() {
  const [selectedAddress, setSelectedAddress] = useState('São Paulo, SP');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [favoritedIds, setFavoritedIds] = useState<string[]>([]);
  const router = useRouter();

  useFocusEffect(() => {
    const loadFavorited = async () => {
      try {
        const stored = await AsyncStorage.getItem('favoritedIds');
        if (stored) {
          setFavoritedIds(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading favorited:', error);
      }
    };
    loadFavorited();
  });

  const handleFavoriteToggle = async (id: string) => {
    const newFavorited = favoritedIds.includes(id)
      ? favoritedIds.filter(favId => favId !== id)
      : [...favoritedIds, id];
    setFavoritedIds(newFavorited);
    try {
      await AsyncStorage.setItem('favoritedIds', JSON.stringify(newFavorited));
    } catch (error) {
      console.error('Error saving favorited:', error);
    }
  };

  const handleSelectAddress = (address: string) => {
    setSelectedAddress(address);
    setShowSearchModal(false);
    setSearchText('');
  };

  const filteredAddresses = ADDRESSES.filter(addr =>
    addr.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <MapView style={styles.map}
        initialRegion={{
          latitude: -23.942355,
          longitude: -46.326303,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{ latitude: -23.942355, longitude: -46.326303 }}
          title="Posto de Vacinação"
          pinColor='rgb(32, 50, 71)'
        />
      </MapView>
      <View style={styles.topContainer}>
        <View style={styles.addressContainer}>
          <Pressable 
            style={styles.addressSelector}
            onPress={() => setShowSearchModal(true)}
          >
            <Text style={styles.addressSelectorText}>{selectedAddress}</Text>
            <Ionicons 
              name="locate-outline" 
              size={20} 
              color="#000000ff" 
            />
          </Pressable>
        </View>
        <Ionicons name="notifications-outline" size={26} color="#000000ff" style={{ position: 'absolute', right: '5%', bottom: '10%', backgroundColor: '#ACDAD8', borderRadius: 16, padding: 2  }} />
      </View>
      <View style={styles.cardContainer}>
        <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4, color: '#333' }}>
          Unidades Próximas
        </Text>
        <FlatList
          data={LOCS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LocCards 
              card={{ ...item, isFavorited: favoritedIds.includes(item.id) }} 
              onFavoritePress={handleFavoriteToggle} 
              onPress={() => router.push({ pathname: '/location-details', params: { card: JSON.stringify({ ...item, isFavorited: favoritedIds.includes(item.id) }) } })} 
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </View>
      <Modal
        visible={showSearchModal}
        animationType="slide"
        onRequestClose={() => {
          setShowSearchModal(false);
          setSearchText('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.searchHeader}>
            <Pressable onPress={() => {
              setShowSearchModal(false);
              setSearchText('');
            }}>
              <Ionicons name="close" size={24} color="#000" />
            </Pressable>
            <Text style={styles.searchTitle}>Buscar Localização</Text>
          </View>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar localização..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={true}
            />
          </View>
          <FlatList
            data={filteredAddresses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.dropdownItem}
                onPress={() => handleSelectAddress(item.name)}
              >
                <Text style={styles.dropdownItemText}>{item.name}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
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
  map: {
    marginTop: '15%',
    flex: 0.45,
  },
  cardContainer: {
    flex: 0.46,
    backgroundColor: '#CAE3E2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 4,
    paddingHorizontal: 8,
    marginTop: -30,
    paddingBottom: 12,
  },
  topContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ACDAD8',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 10,
    height: '8%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  addressContainer: {
    alignItems: 'center',
    marginBottom: '3%',
  },
  addressSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    paddingHorizontal: 12,
    paddingVertical: 0,
    borderRadius: 12,
    backgroundColor: '#ACDAD8',
  },
  addressSelectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000ff',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    elevation: 5, // for shadow on Android
    shadowColor: '#000', // for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchInputContainer: {
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#000000ff',
  },
  dropdownItemSelected: {
    fontWeight: 'bold',
    color: '#2E8B8B',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#000',
  },
});
