import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomBar } from '../components/BottomBar';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocCard {
  id: string;
  name: string;
  distance: string;
  image: string;
  isFavorited?: boolean;
}

interface VaccineData {
  ageGroup: string;
  vaccines: Array<{ name: string; status: 'Disponível' | 'Indisponível' }>;
}

export default function LocationDetails() {
  const router = useRouter();
  const { card } = useLocalSearchParams() as { card: string };
  const parsedCard: LocCard = JSON.parse(card);
  const [imageHeight, setImageHeight] = useState(200); // default
  const [favoritedIds, setFavoritedIds] = useState<string[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<'vacinas' | 'fotos' | 'sobre'>('vacinas');
  const [expandedAgeGroup, setExpandedAgeGroup] = useState<string>('0 a 9 anos');

  const vaccineData: VaccineData[] = [
    {
      ageGroup: '0 a 9 anos',
      vaccines: [
        { name: 'BCG', status: 'Disponível' },
        { name: 'Hepatite B', status: 'Indisponível' },
        { name: 'Tetravacente', status: 'Disponível' },
        { name: 'Poliomielite', status: 'Disponível' },
        { name: 'Influenza', status: 'Indisponível' },
      ],
    },
    {
      ageGroup: '10 a 19 anos',
      vaccines: [
        { name: 'HPV', status: 'Disponível' },
        { name: 'Meningococo', status: 'Indisponível' },
      ],
    },
    {
      ageGroup: '20 a 24 anos',
      vaccines: [
        { name: 'COVID-19', status: 'Disponível' },
        { name: 'Hepatite A', status: 'Disponível' },
      ],
    },
    {
      ageGroup: '25 a 59 anos',
      vaccines: [
        { name: 'Gripe', status: 'Disponível' },
        { name: 'Pneumococo', status: 'Indisponível' },
      ],
    },
    {
      ageGroup: 'acima de 60 anos',
      vaccines: [
        { name: 'Herpes Zóster', status: 'Disponível' },
        { name: 'Pneumococo 23', status: 'Disponível' },
      ],
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem('favoritedIds');
        if (stored) {
          const ids = JSON.parse(stored);
          setFavoritedIds(ids);
          setIsFavorited(ids.includes(parsedCard.id));
        }
      } catch (error) {
        console.error('Error loading favorited:', error);
      }

      Image.getSize(parsedCard.image, (width, height) => {
        const screenWidth = Dimensions.get('window').width;
        const aspectRatio = width / height;
        const calculatedHeight = screenWidth / aspectRatio;
        setImageHeight(calculatedHeight);
      }, (error) => {
        console.log('Error getting image size:', error);
      });
    };
    loadData();
  }, [parsedCard.image, parsedCard.id]);

  const handleFavoriteToggle = async () => {
    const newFavorited = isFavorited
      ? favoritedIds.filter(id => id !== parsedCard.id)
      : [...favoritedIds, parsedCard.id];
    setFavoritedIds(newFavorited);
    setIsFavorited(!isFavorited);
    try {
      await AsyncStorage.setItem('favoritedIds', JSON.stringify(newFavorited));
    } catch (error) {
      console.error('Error saving favorited:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: parsedCard.image }} style={[styles.image, { height: imageHeight }]} />
      </View>
      
      {/* Header - Fixed */}
      <View style={styles.headerSection}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{parsedCard.name}</Text>
            <View style={styles.iconContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={handleFavoriteToggle}>
                <Ionicons name={isFavorited ? "bookmark" : "bookmark-outline"} size={18} color={isFavorited ? "#29442dff" : "#000"} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Compartilhar')}>
                <Ionicons name="share-social" size={18} color="#29442dff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                <Ionicons name="close" size={18} color="#29442dff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Centro Médico Público</Text>
            <Text style={styles.metaDot}> · </Text>
            <MaterialIcons name="accessible" size={14} color="#333" style={styles.metaIcon} />
            <Text style={styles.metaDot}> · </Text>
            <MaterialIcons name="directions-walk" size={14} color="#333" style={[styles.metaIcon, { marginLeft: 4 }]} />
            <Text style={[styles.metaText, { marginLeft: 6 }]}>{parsedCard.distance}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.openText}>Aberto</Text>
            <Text style={styles.metaDot}> · </Text>
            <Text style={styles.closingText}>Fecha à 17:00</Text>
          </View>
        </View>

        {/* Tabs - Fixed */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === 'vacinas' && styles.tabActive]} onPress={() => setActiveTab('vacinas')}>
            <Text style={[styles.tabText, activeTab === 'vacinas' && styles.tabTextActive]}>Vacinas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'fotos' && styles.tabActive]} onPress={() => setActiveTab('fotos')}>
            <Text style={[styles.tabText, activeTab === 'fotos' && styles.tabTextActive]}>Fotos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'sobre' && styles.tabActive]} onPress={() => setActiveTab('sobre')}>
            <Text style={[styles.tabText, activeTab === 'sobre' && styles.tabTextActive]}>Sobre</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollableContent} contentContainerStyle={styles.tabContentContainer}>
        {activeTab === 'vacinas' && (
          <View style={styles.tabContent}>
            {vaccineData.map((data) => (
              <TouchableOpacity
                key={data.ageGroup}
                style={[styles.ageGroupBox, expandedAgeGroup === data.ageGroup && styles.ageGroupBoxExpanded]}
                onPress={() => setExpandedAgeGroup(expandedAgeGroup === data.ageGroup ? '' : data.ageGroup)}
              >
                <View style={styles.ageGroupHeader}>
                  <Text style={styles.ageGroupTitle}>{data.ageGroup}</Text>
                  <Ionicons
                    name={expandedAgeGroup === data.ageGroup ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#333"
                  />
                </View>
                {expandedAgeGroup === data.ageGroup && (
                  <View style={styles.vaccineList}>
                    {data.vaccines.map((vaccine, idx) => (
                      <View key={idx} style={[styles.vaccineItem, idx === data.vaccines.length - 1 && styles.vaccineItemLast]}>
                        <Text style={styles.vaccineName}>{vaccine.name}</Text>
                        <Text style={[styles.vaccineStatus, vaccine.status === 'Disponível' ? styles.statusAvailable : styles.statusUnavailable]}>
                          {vaccine.status}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'fotos' && (
          <View style={styles.tabContent}>
            <Text style={styles.placeholderText}>Nenhuma foto disponível</Text>
          </View>
        )}

        {activeTab === 'sobre' && (
          <View style={styles.tabContent}>
            <Text style={styles.placeholderText}>Informações sobre o local em breve</Text>
          </View>
        )}
      </ScrollView>

      <BottomBar />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
    zIndex: 1,
  },
  image: {
    width: '100%',
    resizeMode: 'contain',
  },
  headerSection: {
    backgroundColor: '#CAE3E2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    zIndex: 2,
  },
  header: {
    flexDirection: 'column',
    backgroundColor: '#CAE3E2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 12,
  },
  scrollableContent: {
    flex: 1,
    backgroundColor: '#CAE3E2',
  },
  tabContentContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 100,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    padding: 12,
    paddingRight: 8,
  },
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#333',
  },
  metaIcon: {
    marginRight: 2,
  },
  metaDot: {
    color: '#333',
    marginHorizontal: 2,
    fontSize: 12,
    fontWeight: '900',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  openText: {
    color: '#198754',
    fontWeight: '600',
    fontSize: 12,
  },
  closingText: {
    color: '#333',
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    backgroundColor: '#B0D5D3',
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    position: 'relative',
    zIndex: 2,
    marginTop: -20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#CAE3E2',
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.05)',
  },
  distance: {
    fontSize: 12,
    color: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#29442dff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#29442dff',
    fontWeight: '600',
  },
  tabContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#CAE3E2',
  },
  ageGroupBox: {
    backgroundColor: '#B0D5D3',
    borderRadius: 8,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  ageGroupBoxExpanded: {
    backgroundColor: '#B0D5D3',
  },
  ageGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ageGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  vaccineList: {
    marginTop: 8,
    paddingTop: 0,
  },
  vaccineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#9BC5C2',
  },
  vaccineItemLast: {
    borderBottomWidth: 0,
  },
  vaccineName: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  vaccineStatus: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusAvailable: {
    color: '#198754',
  },
  statusUnavailable: {
    color: '#dc3545',
  },
  placeholderText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginVertical: 20,
  },
});