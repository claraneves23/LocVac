import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LocCard {
  id: string;
  name: string;
  distance: string;
  image: string;
  isFavorited?: boolean;
}

interface LocCardsProps {
  card: LocCard;
  onFavoritePress?: (id: string) => void;
}

const LocCards: React.FC<LocCardsProps> = ({ card, onFavoritePress }) => {
  const [isFavorited, setIsFavorited] = useState(card.isFavorited || false);

  const handleFavoritePress = () => {
    setIsFavorited(!isFavorited);
    onFavoritePress?.(card.id);
  };

  return (
    <View style={styles.container}>
      {/* Imagem na esquerda */}
      <Image
        source={{ uri: card.image }}
        style={styles.image}
      />

      {/* Informações no centro */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{card.name}</Text>
        <Text style={styles.distance}>{card.distance}</Text>
      </View>

      {/* Botão de favoritar na direita */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={handleFavoritePress}
      >
        <Ionicons
          name={isFavorited ? 'bookmark' : 'bookmark-outline'}
          size={24}
          color={isFavorited ? '#29442dff' : '#00000040'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 14,
    paddingVertical: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  distance: {
    fontSize: 10,
    color: '#999',
  },
  favoriteButton: {
    padding: 8,
  },
});

export default LocCards;
