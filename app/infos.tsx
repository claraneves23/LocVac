import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, FlatList, Image, Platform, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as NavigationBar from 'expo-navigation-bar';
import { fetchCarrosselAtivos, fetchTodasVacinas } from './service/infoService';
import { CarrosselItemDTO } from './types/info';
import { VacinaDTO } from './service/mandatoryVaccineService';

export default function Infos() {
  const [helpVisible, setHelpVisible] = useState(false);
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [carrosselItems, setCarrosselItems] = useState<CarrosselItemDTO[]>([]);
  const [vacinas, setVacinas] = useState<VacinaDTO[]>([]);
  const [loadingCarrossel, setLoadingCarrossel] = useState(true);
  const [loadingVacinas, setLoadingVacinas] = useState(true);

  useEffect(() => {
    fetchCarrosselAtivos()
      .then((data) => setCarrosselItems(data))
      .catch((err) => console.log('Erro ao carregar carrossel:', err?.response?.status, err?.response?.data || err?.message))
      .finally(() => setLoadingCarrossel(false));

    fetchTodasVacinas()
      .then((data) => {
        const unicas = data.filter((v, i, arr) => arr.findIndex((x) => x.nome === v.nome) === i);
        setVacinas(unicas);
      })
      .catch((err) => console.log('Erro ao carregar vacinas:', err?.response?.status, err?.response?.data || err?.message))
      .finally(() => setLoadingVacinas(false));
  }, []);

  useEffect(() => {
    const updateSystemBars = async () => {
      if (Platform.OS !== 'android') return;
      try {
        if (helpVisible) {
          await NavigationBar.setBackgroundColorAsync('#80000000');
          await NavigationBar.setButtonStyleAsync('light');
          await NavigationBar.setVisibilityAsync('visible');
        } else {
          await NavigationBar.setBackgroundColorAsync('#00FFFFFF');
          await NavigationBar.setButtonStyleAsync('dark');
        }
      } catch (error) {
        console.log('NavigationBar API não disponível no Expo Go');
      }
    };
    updateSystemBars();
  }, [helpVisible]);

  const handleCarouselPress = (item: CarrosselItemDTO) => {
    router.push({
      pathname: '/infos/carousel/[id]',
      params: { id: item.id, titulo: item.titulo },
    });
  };

  const handleVaccinePress = (vaccine: VacinaDTO) => {
    router.push({
      pathname: '/infos/vaccine-details',
      params: { vaccineId: vaccine.id, vaccineName: vaccine.nome },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.helpButton} onPress={() => setHelpVisible(true)}>
          <Ionicons name="help-circle-outline" size={28} color="#29442dff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.carouselSection}>
          {loadingCarrossel ? (
            <ActivityIndicator size="large" color="#29442dff" style={{ marginTop: 24 }} />
          ) : carrosselItems.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum conteúdo disponível no momento.</Text>
          ) : (
            <>
              <FlatList
                data={carrosselItems}
                horizontal
                pagingEnabled={false}
                snapToInterval={292}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => String(item.id)}
                onScroll={(event) => {
                  if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                  const contentOffsetX = event.nativeEvent.contentOffset.x;
                  scrollTimeoutRef.current = setTimeout(() => {
                    setActiveSlide(Math.round(contentOffsetX / 292));
                  }, 10);
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.carouselCard}
                    onPress={() => handleCarouselPress(item)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.imagemUrl }} style={styles.carouselImage} />
                    <View style={styles.carouselContent}>
                      <Text style={styles.carouselTitle}>{item.titulo}</Text>
                      <Text style={styles.carouselDescription}>{item.descricao}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
              <View style={styles.carouselIndicators}>
                {carrosselItems.map((_, index) => (
                  <View
                    key={index}
                    style={[styles.indicator, activeSlide === index && styles.indicatorActive]}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.vaccinesSection}>
          <Text style={styles.sectionTitle}>Vacinas</Text>
          {loadingVacinas ? (
            <ActivityIndicator size="large" color="#29442dff" style={{ marginTop: 24 }} />
          ) : vacinas.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma vacina disponível no momento.</Text>
          ) : (
            vacinas.map((vaccine) => (
              <TouchableOpacity
                key={vaccine.id}
                style={styles.vaccineItem}
                onPress={() => handleVaccinePress(vaccine)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={24}
                  color="#29442dff"
                  style={styles.vaccineIcon}
                />
                <Text style={styles.vaccineName}>{vaccine.nome}</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#29442dff" />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <Modal
        visible={helpVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setHelpVisible(false)}
      >
        <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.5)" translucent />
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setHelpVisible(false)} activeOpacity={1} />
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setHelpVisible(false)}>
              <Ionicons name="close-circle-outline" size={32} color="#29442dff" />
            </TouchableOpacity>
            <Ionicons name="help-circle-outline" size={64} color="#29442dff" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>O que é a área de Informações?</Text>
            <Text style={styles.modalDescription}>
              A área de Informações é um espaço dedicado a ajudá-lo a conhecer melhor sobre vacinações. Aqui você encontra:
            </Text>
            <View style={styles.modalList}>
              <View style={styles.modalListItem}>
                <Text style={styles.modalBullet}>•</Text>
                <Text style={styles.modalListText}>
                  <Text style={styles.bold}>Saiba Mais:</Text> Artigos e informações sobre vacinas, cronogramas e efeitos colaterais
                </Text>
              </View>
              <View style={styles.modalListItem}>
                <Text style={styles.modalBullet}>•</Text>
                <Text style={styles.modalListText}>
                  <Text style={styles.bold}>Vacinas:</Text> Detalhes completos sobre cada vacina, incluindo indicações e recomendações
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setHelpVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <StatusBar style={helpVisible ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAE3E2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: '10%',
  },
  helpButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#29442dff',
    marginBottom: 12,
    marginTop: 16,
  },
  carouselSection: {
    marginVertical: 16,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  carouselCard: {
    width: 280,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  carouselImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  carouselContent: {
    padding: 12,
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#29442dff',
    marginBottom: 4,
  },
  carouselDescription: {
    fontSize: 12,
    color: '#666',
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ACDAD8',
  },
  indicatorActive: {
    backgroundColor: '#29442dff',
    width: 24,
  },
  vaccinesSection: {
    marginBottom: '10%',
  },
  vaccineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  vaccineIcon: {
    marginRight: 12,
  },
  vaccineName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#607367',
    fontSize: 13,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  modalIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#29442dff',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalList: {
    marginBottom: 20,
  },
  modalListItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  modalBullet: {
    fontSize: 14,
    color: '#29442dff',
    marginRight: 8,
    marginTop: 2,
  },
  modalListText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '600',
    color: '#29442dff',
  },
  modalCloseButton: {
    backgroundColor: '#29442dff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
