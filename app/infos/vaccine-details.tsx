import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Skeleton from '../../components/redesign/Skeleton';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { fetchInformativosPorVacina, fetchEfeitosColateraisPorVacina } from '../../src/service/infoService';
import { VacinaInformativoDTO, EfeitoColateralDTO } from '../../src/types/info';
import { colors, radii, shadows, spacing, typography, tonePairs, Tone } from '../../src/theme/tokens';
import { ScreenTitle } from '../../components/redesign';

const SEVERIDADE_TONE: Record<EfeitoColateralDTO['severidade'], Tone> = {
  LEVE: 'success',
  MODERADA: 'warn',
  GRAVE: 'danger',
};

const SEVERIDADE_LABEL: Record<EfeitoColateralDTO['severidade'], string> = {
  LEVE: 'Leve',
  MODERADA: 'Moderada',
  GRAVE: 'Grave',
};

export default function VaccineDetails() {
  const { vaccineId, vaccineName } = useLocalSearchParams<{ vaccineId: string; vaccineName: string }>();
  const router = useRouter();
  const [informativos, setInformativos] = useState<VacinaInformativoDTO[]>([]);
  const [efeitos, setEfeitos] = useState<EfeitoColateralDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vaccineId) return;
    const id = Number(vaccineId);
    Promise.all([
      fetchInformativosPorVacina(id),
      fetchEfeitosColateraisPorVacina(id),
    ])
      .then(([info, efts]) => {
        setInformativos(info);
        setEfeitos(efts);
      })
      .finally(() => setLoading(false));
  }, [vaccineId]);

  return (
    <View style={styles.container}>
      <ScreenTitle title={String('')} back={() => router.back()} />

      {loading ? (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.heroCard}>
            <Skeleton width={56} height={56} radius={28} />
            <Skeleton width="58%" height={22} radius={6} style={{ marginTop: 4 }} />
            <Skeleton width="78%" height={13} radius={4} />
          </View>

          {/* Seções de informativo */}
          {[['45%', '100%', '90%', '72%'], ['55%', '100%', '88%', '60%']].map((widths, si) => (
            <View key={si} style={styles.section}>
              <Skeleton width={widths[0]} height={18} radius={6} style={{ marginBottom: spacing.sm }} />
              <View style={styles.sectionCard}>
                {widths.slice(1).map((w, li) => (
                  <Skeleton key={li} width={w} height={13} radius={4} style={li < 2 ? { marginBottom: 8 } : undefined} />
                ))}
              </View>
            </View>
          ))}

          {/* Source box */}
          <View style={[styles.sourceBox, { marginBottom: spacing.lg }]}>
            <Skeleton width={14} height={14} radius={4} />
            <Skeleton width="52%" height={11} radius={4} />
          </View>

          {/* Efeitos colaterais */}
          <View style={styles.section}>
            <Skeleton width="42%" height={18} radius={6} style={{ marginBottom: spacing.sm }} />
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.efeitoCard, { backgroundColor: colors.bgMuted, borderLeftColor: colors.line, marginBottom: spacing.sm }]}>
                <View style={[styles.efeitoHeader]}>
                  <Skeleton width={16} height={16} radius={8} />
                  <Skeleton width={56} height={11} radius={4} />
                </View>
                <Skeleton width="82%" height={13} radius={4} style={{ marginBottom: 6 }} />
                <Skeleton width="62%" height={11} radius={4} />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="shield-checkmark" size={28} color={colors.brandInk} />
            </View>
            <Text style={styles.heroTitle}>{vaccineName}</Text>
            <Text style={styles.heroSub}>Informações oficiais e reações conhecidas</Text>
          </View>

          {informativos.length === 0 && efeitos.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIcon}>
                <Ionicons name="information-circle-outline" size={28} color={colors.brandInk} />
              </View>
              <Text style={styles.emptyTitle}>Sem informações</Text>
              <Text style={styles.emptyText}>Nenhuma informação cadastrada para esta vacina ainda.</Text>
            </View>
          ) : (
            <>
              {informativos.map((informativo) => (
                <View key={informativo.id}>
                  {informativo.secoes.map((secao) => (
                    <View key={secao.id} style={styles.section}>
                      <Text style={styles.sectionTitle}>{secao.tituloSecao}</Text>
                      <View style={styles.sectionCard}>
                        <Text style={styles.sectionContent}>{secao.conteudo}</Text>
                      </View>
                    </View>
                  ))}

                  <View style={styles.sourceBox}>
                    <Ionicons name="document-text-outline" size={14} color={colors.ink3} />
                    <Text style={styles.sourceText}>
                      {informativo.orgaoEmissor} · v{informativo.versao} · {informativo.dataPublicacao}
                    </Text>
                  </View>
                </View>
              ))}

              {efeitos.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Possíveis reações</Text>
                  {efeitos.map((efeito) => {
                    const tone = tonePairs[SEVERIDADE_TONE[efeito.severidade]];
                    return (
                      <View
                        key={efeito.id}
                        style={[styles.efeitoCard, { backgroundColor: tone.bg, borderLeftColor: tone.solid }]}
                      >
                        <View style={styles.efeitoHeader}>
                          <Ionicons name="alert-circle" size={16} color={tone.ink} />
                          <Text style={[styles.efeitoSeveridade, { color: tone.ink }]}>
                            {SEVERIDADE_LABEL[efeito.severidade]}
                          </Text>
                        </View>
                        <Text style={styles.efeitoDescricao}>{efeito.descricao}</Text>
                        {efeito.orientacao ? (
                          <Text style={styles.efeitoOrientacao}>{efeito.orientacao}</Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}

          <View style={styles.recommendationBox}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.recommendationText}>
              Sempre consulte um profissional de saúde para dúvidas sobre vacinação e cronograma.
            </Text>
          </View>
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
  heroCard: {
    backgroundColor: colors.bgElev,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    ...typography.h2,
    color: colors.ink,
    textAlign: 'center',
  },
  heroSub: {
    ...typography.small,
    color: colors.ink3,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  sectionCard: {
    backgroundColor: colors.bgElev,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
  },
  sectionContent: {
    ...typography.body,
    color: colors.ink2,
  },
  sourceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  sourceText: {
    ...typography.caption,
    color: colors.ink3,
  },
  efeitoCard: {
    borderRadius: radii.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  efeitoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  efeitoSeveridade: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  efeitoDescricao: {
    ...typography.body,
    color: colors.ink,
    marginBottom: 4,
  },
  efeitoOrientacao: {
    ...typography.small,
    color: colors.ink2,
    fontStyle: 'italic',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...typography.bodyLg,
    fontWeight: '600',
    color: colors.ink,
  },
  emptyText: {
    ...typography.small,
    color: colors.ink3,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  recommendationBox: {
    flexDirection: 'row',
    backgroundColor: colors.successSoft,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: 10,
    marginTop: spacing.sm,
    alignItems: 'flex-start',
  },
  recommendationText: {
    flex: 1,
    ...typography.small,
    color: colors.successInk,
    lineHeight: 18,
  },
});
