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
import { fetchCarrosselAtivos, fetchTodasVacinas } from './service/infoService';
import { CarrosselItemDTO } from './types/info';
import { VacinaDTO } from './service/mandatoryVaccineService';
import { colors, radii, shadows, typography } from './theme/tokens';
import Skeleton from '../components/redesign/Skeleton';

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

const TONE_BG: Record<string, string> = {
  brand: colors.brandSoft,
  coral: colors.coralSoft,
  ochre: colors.ochreSoft,
};
const TONE_INK: Record<string, string> = {
  brand: colors.brandInk,
  coral: colors.coralInk,
  ochre: colors.ochreInk,
};

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
          await NavigationBar.setBackgroundColorAsync('#80000000');
          await NavigationBar.setButtonStyleAsync('light');
          await NavigationBar.setVisibilityAsync('visible');
        } else {
          await NavigationBar.setBackgroundColorAsync('#00FFFFFF');
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
              <Ionicons name="help-circle-outline" size={22} color={colors.brand} />
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
                  <Ionicons name="checkmark-circle" size={22} color={colors.brand} />
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
                      <Ionicons name="checkmark-circle" size={22} color={colors.brand} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 48,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgElev,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElev,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 14,
    color: colors.ink,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 4,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.ink,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.line,
    maxWidth: 180,
  },
  filterButtonActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  sheetOverlay: {
    flex: 1,
    backgroundColor: colors.dimDark,
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: colors.bgElev,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    ...shadows.lg,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lineStrong,
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetTitle: {
    ...typography.h3,
    color: colors.ink,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    marginVertical: 2,
  },
  filterOptionActive: {
    backgroundColor: colors.brandSoft,
  },
  filterOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  filterOptionSub: {
    fontSize: 12,
    color: colors.ink3,
    marginTop: 2,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  carrosselSection: {
    marginHorizontal: -16,
    marginTop: '5%',
    marginBottom: 12,
    paddingLeft: 16,
  },
  carrosselCard: {
    width: 280,
    marginRight: 12,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.line,
  },
  carrosselImage: {
    width: '100%',
    height: 140,
    backgroundColor: colors.bgMuted,
  },
  carrosselContent: {
    padding: 12,
  },
  carrosselTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  carrosselDescription: {
    fontSize: 12,
    color: colors.ink2,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
    marginRight: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lineStrong,
  },
  indicatorActive: {
    backgroundColor: colors.brand,
    width: 24,
  },

  groupSection: {
    marginTop: 18,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  groupIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupLabel: {
    ...typography.h3,
    color: colors.ink,
  },
  groupSub: {
    fontSize: 11,
    color: colors.ink3,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  vaccineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 6,
  },
  vaccineDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaccineName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  vaccineSub: {
    fontSize: 12,
    color: colors.ink3,
    marginTop: 2,
  },

  empty: {
    marginTop: 16,
    padding: 22,
    borderRadius: radii.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.ink3,
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.dimDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  modalContent: {
    backgroundColor: colors.bgElev,
    borderRadius: radii.xl,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 26,
    width: '100%',
    maxWidth: 420,
    ...shadows.lg,
    gap: 8,
  },
  modalClose: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 14,
  },
  modalText: {
    fontSize: 13,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 26,
  },
  modalCta: {
    backgroundColor: colors.brand,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCtaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
