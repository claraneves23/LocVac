import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Skeleton from '../../../components/redesign/Skeleton';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { fetchCarrosselConteudo } from '../../../src/service/infoService';
import { CarrosselConteudoDTO } from '../../../src/types/info';
import { colors, radii, shadows, spacing, typography } from '../../../src/theme/tokens';
import { ScreenTitle } from '../../../components/redesign';

export default function CarrosselDetalhe() {
  const { id, titulo } = useLocalSearchParams<{ id: string; titulo: string }>();
  const router = useRouter();
  const [secoes, setSecoes] = useState<CarrosselConteudoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarrosselConteudo(Number(id))
      .then(data => setSecoes(data))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <View style={styles.container}>
      <ScreenTitle title={String(titulo || 'Conteúdo')} back={() => router.back()} />

      {loading ? (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          {[['52%', '100%', '88%', '70%'], ['40%', '100%', '92%', '75%', '55%'], ['58%', '100%', '80%']].map((widths, si) => (
            <View key={si} style={styles.secaoCard}>
              <Skeleton width={widths[0]} height={18} radius={6} style={{ marginBottom: spacing.sm }} />
              {widths.slice(1).map((w, li) => (
                <Skeleton key={li} width={w} height={13} radius={4} style={{ marginBottom: li < widths.length - 2 ? 8 : spacing.sm }} />
              ))}
              <View style={styles.itensList}>
                {[0, 1, 2].map((j) => (
                  <View key={j} style={styles.itemRow}>
                    <Skeleton width={7} height={7} radius={4} style={{ marginTop: 8 }} />
                    <Skeleton width={`${62 + j * 8}%`} height={13} radius={4} />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          {secoes.map((secao) => (
            <View key={secao.id} style={styles.secaoCard}>
              <Text style={styles.secaoTitulo}>{secao.tituloSecao}</Text>

              {secao.conteudo ? (
                <Text style={styles.secaoConteudo}>{secao.conteudo}</Text>
              ) : null}

              {secao.itens && secao.itens.length > 0 ? (
                <View style={styles.itensList}>
                  {secao.itens.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemBullet} />
                      <Text style={styles.itemTexto}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: '5%',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: 130,
  },
  secaoCard: {
    backgroundColor: colors.bgElev,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  secaoTitulo: {
    ...typography.h3,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  secaoConteudo: {
    ...typography.body,
    color: colors.ink2,
  },
  itensList: {
    marginTop: spacing.sm,
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemBullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.brand,
    marginTop: 8,
  },
  itemTexto: {
    flex: 1,
    ...typography.body,
    color: colors.ink2,
  },
});
