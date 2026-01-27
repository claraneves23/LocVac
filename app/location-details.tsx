import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
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

export default function LocationDetails() {
  const router = useRouter();
  const { card } = useLocalSearchParams() as { card: string };
  const parsedCard: LocCard = JSON.parse(card);
  const [imageHeight, setImageHeight] = useState(200); // default
  const [favoritedIds, setFavoritedIds] = useState<string[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

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
      <View style={styles.scrollContainer}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{parsedCard.name}</Text>
            <View style={styles.iconContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={handleFavoriteToggle}>
                <Ionicons name={isFavorited ? "bookmark" : "bookmark-outline"} size={20} color={isFavorited ? "#29442dff" : "#000"} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Compartilhar')}>
                <Ionicons name="share-social-outline" size={20} color="#29442dff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                <Ionicons name="close-outline" size={20} color="#29442dff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.details}>
            <Text style={styles.distance}>Distância: {parsedCard.distance}</Text>
            {/* Add more details if needed */}
          </View>
        </ScrollView>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal:0,
    paddingVertical: 0,
    backgroundColor: '#CAE3E2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    backgroundColor: '#ACDAD890',
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    backgroundColor: '#CAE3E2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageContainer: {
    position: 'relative',
    zIndex: 1,
  },
  scrollContainer: {
    position: 'relative',
    zIndex: 2,
    marginTop: -20,
  },
  image: {
    width: '100%',
    resizeMode: 'contain',
  },
  details: {
    // Add styles for details
  },
  distance: {
    fontSize: 12,
    color: '#333',
  },
});