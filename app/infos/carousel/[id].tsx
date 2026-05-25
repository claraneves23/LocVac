import { StatusBar } from 'expo-status-bar';
import { ComponentType, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Skeleton from '../../../components/redesign/Skeleton';
import { fetchCarrosselConteudo } from '../../../src/service/infoService';
import { CarrosselConteudoDTO } from '../../../src/types/info';
import { type Colors, spacing } from '../../../src/theme/tokens';
import { ScreenTitle } from '../../../components/redesign';
import { useTheme } from '../../../src/context/ThemeContext';
import DefaultLayout from './layouts/DefaultLayout';
import CronogramaTimeline from './layouts/CronogramaTimeline';

type LayoutProps = { secoes: CarrosselConteudoDTO[] };

// Registro de layouts: adicione novos templates aqui.
// Para criar um novo: defina string no campo `template` de carrossel_item
// e mapeie o nome para o componente abaixo.
const LAYOUTS: Record<string, ComponentType<LayoutProps>> = {
  default: DefaultLayout,
  cronograma: CronogramaTimeline,
};

export default function CarrosselDetalhe() {
  const { id, titulo, template } = useLocalSearchParams<{
    id: string;
    titulo: string;
    template?: string;
  }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [secoes, setSecoes] = useState<CarrosselConteudoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarrosselConteudo(Number(id))
      .then((data) => setSecoes(data))
      .finally(() => setLoading(false));
  }, [id]);

  const Layout = LAYOUTS[template || 'default'] ?? LAYOUTS.default;

  return (
    <View style={styles.container}>
      <ScreenTitle title={String(titulo || 'Conteúdo')} back={() => router.back()} />

      {loading ? (
        <ScrollView contentContainerStyle={styles.skeletonContainer} showsVerticalScrollIndicator={false}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <Skeleton width="50%" height={18} radius={6} style={{ marginBottom: spacing.sm }} />
              <Skeleton width="100%" height={13} radius={4} style={{ marginBottom: 6 }} />
              <Skeleton width="85%" height={13} radius={4} style={{ marginBottom: 6 }} />
              <Skeleton width="60%" height={13} radius={4} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <Layout secoes={secoes} />
      )}

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
      paddingTop: '5%',
    },
    skeletonContainer: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: 130,
    },
    skeletonCard: {
      backgroundColor: c.bgElev,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.line,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
  });
