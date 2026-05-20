import { StatusBar } from 'expo-status-bar';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as NavigationBar from 'expo-navigation-bar';
import { fetchCarrosselAtivos, fetchTodasVacinas } from '../../src/service/infoService';
import { CarrosselItemDTO } from '../../src/types/info';
import { VacinaDTO } from '../../src/service/mandatoryVaccineService';
import { makeStyles } from '../../src/styles/infos';
import { useTheme } from '../../src/context/ThemeContext';
import Skeleton from '../../components/redesign/Skeleton';

type AgeGroupId = 'all' | 'baby' | 'child' | 'teen' | 'adult' | 'senior' | 'pregnant';

type AgeGroup = {
  id: AgeGroupId;
  label: string;
  sub?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tone: 'brand' | 'coral' | 'ochre';
  // Faixa em meses (null = sem limite). Usado para casar com idadeMinima/Maxima da vacina.
  minMonths: number | null;
  maxMonths: number | null;
};

const AGE_GROUPS: AgeGroup[] = [
  { id: 'baby',     label: 'Bebês',        sub: '0 a 2 anos',      icon: 'heart-outline',   tone: 'brand', minMonths: 0,    maxMonths: 24 },
  { id: 'child',    label: 'Crianças',     sub: '3 a 9 anos',      icon: 'sparkles-outline', tone: 'brand', minMonths: 36,   maxMonths: 108 },
  { id: 'teen',     label: 'Adolescentes', sub: '10 a 19 anos',    icon: 'shield-outline',  tone: 'ochre', minMonths: 120,  maxMonths: 228 },
  { id: 'adult',    label: 'Adultos',      sub: '20 a 59 anos',    icon: 'person-outline',  tone: 'ochre', minMonths: 240,  maxMonths: 708 },
  { id: 'senior',   label: 'Idosos',       sub: '60 anos ou mais', icon: 'person-outline',  tone: 'coral', minMonths: 720,  maxMonths: null },
  { id: 'pregnant', label: 'Gestantes',    sub: 'Pré-natal',       icon: 'heart-outline',   tone: 'coral', minMonths: null, maxMonths: null },
];

const getDoseLabel = (dose: string | null | undefined): string => {
  if (!dose) return '';
  const d = dose.toLowerCase();
  if (d.includes('unica') || d.includes('única')) return 'Dose única';
  return 'Múltiplas doses';
};

const overlapsGroup = (vaccine: VacinaDTO, group: AgeGroup): boolean => {
  if (group.id === 'pregnant') {
    const text = `${vaccine.nome} ${vaccine.descricao || ''}`.toLowerCase();
    return /gestante|pré.?natal|gravid/.test(text);
  }
  // Sem dados de idade: exibe em todos os grupos
  if (vaccine.idadeMinimaMeses === null && vaccine.idadeMaximaMeses === null) return true;

  const vMin = vaccine.idadeMinimaMeses ?? 0;
  const gMin = group.minMonths ?? 0;
  const gMax = group.maxMonths ?? Number.POSITIVE_INFINITY;

  if (vaccine.idadeMaximaMeses !== null) {
    // Com idade máxima definida: intervalo real da vacina deve sobrepor o grupo
    return vaccine.idadeMaximaMeses >= gMin && vMin <= gMax;
  }
  // Sem idade máxima: a vacina pertence apenas ao grupo onde sua idade mínima cai
  return vMin >= gMin && vMin <= gMax;
};

export default function Infos() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const TONE_BG: Record<string, string> = { brand: colors.brandSoft, coral: colors.coralSoft, ochre: colors.ochreSoft };
  const TONE_INK: Record<string, string> = { brand: colors.brandInk, coral: colors.coralInk, ochre: colors.ochreInk };
  const router = useRouter();
  const [helpVisible, setHelpVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [carrosselItems, setCarrosselItems] = useState<CarrosselItemDTO[]>([]);
  const [vacinas, setVacinas] = useState<VacinaDTO[]>([]);
  const [loadingCarrossel, setLoadingCarrossel] = useState(true);
  const [loadingVacinas, setLoadingVacinas] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<AgeGroupId>('all');

  useEffect(() => {
    fetchCarrosselAtivos()
      .then(setCarrosselItems)
      .catch(() => setCarrosselItems([]))
      .finally(() => setLoadingCarrossel(false));
    fetchTodasVacinas()
      .then((data) => {
        const unicas = data.filter((v, i, arr) => arr.findIndex((x) => x.nome === v.nome) === i);
        setVacinas(unicas);
      })
      .catch(() => setVacinas([]))
      .finally(() => setLoadingVacinas(false));
  }, []);

  useEffect(() => {
    const updateBars = async () => {
      if (Platform.OS !== 'android') return;
      try {
        if (helpVisible || filterVisible) {
          await NavigationBar.setButtonStyleAsync('light');
          await NavigationBar.setVisibilityAsync('visible');
        } else {
          await NavigationBar.setButtonStyleAsync('dark');
        }
      } catch {}
    };
    updateBars();
  }, [helpVisible, filterVisible]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vacinas.filter((v) => {
      const matchesQuery = !q || v.nome.toLowerCase().includes(q);
      if (!matchesQuery) return false;
      if (activeGroup === 'all') return true;
      const group = AGE_GROUPS.find((g) => g.id === activeGroup);
      if (!group) return true;
      return overlapsGroup(v, group);
    });
  }, [vacinas, query, activeGroup]);

  const grouped = useMemo(() => {
    const groupsToShow =
      activeGroup === 'all'
        ? AGE_GROUPS
        : AGE_GROUPS.filter((g) => g.id === activeGroup);
    return groupsToShow
      .map((group) => ({
        group,
        items: filtered.filter((v) => overlapsGroup(v, group)),
      }))
      .filter((g) => g.items.length > 0);
  }, [filtered, activeGroup]);

  const handleVaccinePress = (vaccine: VacinaDTO) => {
    router.push({
      pathname: '/infos/vaccine-details',
      params: { vaccineId: vaccine.id, vaccineName: vaccine.nome },
    });
  };

  const handleCarouselPress = (item: CarrosselItemDTO) => {
    router.push({
      pathname: '/infos/carousel/[id]',
      params: { id: item.id, titulo: item.titulo },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.helpButton} onPress={() => setHelpVisible(true)}>
          <Ionicons name="help-circle-outline" size={22} color={colors.ink2} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Featured carrossel */}
        {loadingCarrossel ? (
          <View style={[styles.carrosselSection, { flexDirection: 'row', paddingRight: 16 }]}>
            {[0, 1].map((i) => (
              <View key={i} style={styles.carrosselCard}>
                <Skeleton width={280} height={140} radius={0} />
                <View style={{ padding: 12, gap: 8 }}>
                  <Skeleton width="70%" height={14} />
                  <Skeleton width="45%" height={11} />
                </View>
              </View>
            ))}
          </View>
        ) : carrosselItems.length > 0 ? (
          <View style={styles.carrosselSection}>
            <FlatList
              data={carrosselItems}
              horizontal
              snapToInterval={292}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              onScroll={(event) => {
                if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                const x = event.nativeEvent.contentOffset.x;
                scrollTimeoutRef.current = setTimeout(() => {
                  setActiveSlide(Math.round(x / 292));
                }, 10);
              }}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.carrosselCard}
                  onPress={() => handleCarouselPress(item)}
                >
                  <Image source={{ uri: item.imagemUrl }} style={styles.carrosselImage} />
                  <View style={styles.carrosselContent}>
                    <Text style={styles.carrosselTitle}>{item.titulo}</Text>
                    <Text style={styles.carrosselDescription} numberOfLines={2}>
                      {item.descricao}
                    </Text>
                  </View>
                </Pressable>
              )}
            />
            <View style={styles.indicators}>
              {carrosselItems.map((_, i) => (
                <View key={i} style={[styles.indicator, activeSlide === i && styles.indicatorActive]} />
              ))}
            </View>
          </View>
        ) : null}

        {/* Busca */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.ink3} style={{ marginLeft: 12, marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar vacina"
            placeholderTextColor={colors.ink3}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="close-circle" size={18} color={colors.ink3} />
            </Pressable>
          )}
        </View>

        {/* Lista por faixa etária */}
        {loadingVacinas ? (
          <>
            <View style={styles.sectionHeader}>
              <Skeleton width={80} height={20} />
              <Skeleton width={60} height={28} radius={999} />
            </View>
            {[0, 1].map((gi) => (
              <View key={gi} style={styles.groupSection}>
                <View style={styles.groupHeader}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Skeleton width="40%" height={18} />
                    <Skeleton width="55%" height={10} style={{ marginTop: 4 }} />
                  </View>
                </View>
                {[0, 1, 2, 3].map((i) => (
                  <View key={i} style={styles.vaccineRow}>
                    <Skeleton width={32} height={32} radius={10} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <Skeleton width="65%" height={14} />
                      <Skeleton width="40%" height={10} />
                    </View>
                    <Skeleton width={18} height={18} radius={4} />
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Vacinas</Text>
              <Pressable
                style={[styles.filterButton, activeGroup !== 'all' && styles.filterButtonActive]}
                onPress={() => setFilterVisible(true)}
              >
                <Ionicons
                  name="options-outline"
                  size={18}
                  color={activeGroup !== 'all' ? '#fff' : colors.ink2}
                />
                {activeGroup !== 'all' && (
                  <Text style={styles.filterButtonText} numberOfLines={1}>
                    {AGE_GROUPS.find((g) => g.id === activeGroup)?.label}
                  </Text>
                )}
              </Pressable>
            </View>
            {grouped.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Nenhum verbete encontrado.</Text>
              </View>
            ) : (
          grouped.map(({ group, items }) => (
            <View key={group.id} style={styles.groupSection}>
              <View style={styles.groupHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupLabel}>{group.label}</Text>
                  <Text style={styles.groupSub}>
                    {group.sub} · {items.length} {items.length === 1 ? 'vacina' : 'vacinas'}
                  </Text>
                </View>
              </View>
              {items.map((v) => (
                <Pressable
                  key={`${group.id}-${v.id}`}
                  style={styles.vaccineRow}
                  onPress={() => handleVaccinePress(v)}
                >
                  <View style={[styles.vaccineDot, { backgroundColor: TONE_BG[group.tone] }]}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={TONE_INK[group.tone]} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.vaccineName} numberOfLines={1}>{v.nome}</Text>
                    {v.dose ? (
                      <Text style={styles.vaccineSub} numberOfLines={1}>{getDoseLabel(v.dose)}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.ink3} />
                </Pressable>
              ))}
            </View>
          ))
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={helpVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setHelpVisible(false)}
      >
        <StatusBar style="light" />
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setHelpVisible(false)} />
          <View style={styles.modalContent}>
            <Pressable style={styles.modalClose} onPress={() => setHelpVisible(false)}>
              <Ionicons name="close" size={22} color={colors.ink2} />
            </Pressable>
            <View style={[styles.groupIcon, { backgroundColor: colors.brandSoft, alignSelf: 'center', marginTop: 8 }]}>
              <Ionicons name="help-circle-outline" size={22} color={colors.brandInk} />
            </View>
            <Text style={styles.modalTitle}>O que é a Biblioteca?</Text>
            <Text style={styles.modalText}>
              Aqui você encontra informações detalhadas sobre cada vacina e conteúdos sobre vacinação,
              organizados por faixa etária.
            </Text>
            <Pressable style={styles.modalCta} onPress={() => setHelpVisible(false)}>
              <Text style={styles.modalCtaText}>Entendi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setFilterVisible(false)}
      >
        <StatusBar style="light" />
        <View style={styles.sheetOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setFilterVisible(false)} />
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filtrar por faixa etária</Text>
              <Pressable style={styles.modalClose} onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={20} color={colors.ink2} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <Pressable
                onPress={() => {
                  setActiveGroup('all');
                  setFilterVisible(false);
                }}
                style={[styles.filterOption, activeGroup === 'all' && styles.filterOptionActive]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.filterOptionLabel}>Todas as faixas</Text>
                  <Text style={styles.filterOptionSub}>Mostrar todas as vacinas</Text>
                </View>
                {activeGroup === 'all' && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.brandInk} />
                )}
              </Pressable>
              {AGE_GROUPS.map((g) => {
                const selected = activeGroup === g.id;
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => {
                      setActiveGroup(g.id);
                      setFilterVisible(false);
                    }}
                    style={[styles.filterOption, selected && styles.filterOptionActive]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.filterOptionLabel}>{g.label}</Text>
                      {g.sub ? <Text style={styles.filterOptionSub}>{g.sub}</Text> : null}
                    </View>
                    {selected && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.brandInk} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <StatusBar style={helpVisible || filterVisible ? 'light' : 'dark'} />
    </View>
  );
}
