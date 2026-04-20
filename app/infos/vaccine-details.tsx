import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { fetchInformativosPorVacina, fetchEfeitosColateraisPorVacina } from '../service/infoService';
import { VacinaInformativoDTO, EfeitoColateralDTO } from '../types/info';

const SEVERIDADE_COR: Record<EfeitoColateralDTO['severidade'], string> = {
  LEVE: '#FFF3E0',
  MODERADA: '#FFF8E1',
  GRAVE: '#FFEBEE',
};

const SEVERIDADE_TEXTO: Record<EfeitoColateralDTO['severidade'], string> = {
  LEVE: '#E65100',
  MODERADA: '#F57F17',
  GRAVE: '#B71C1C',
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#29442dff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{vaccineName}</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#29442dff" style={{ marginTop: 48 }} />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.mainInfo}>
            <Ionicons name="shield-checkmark-outline" size={64} color="#29442dff" />
            <Text style={styles.vaccineTitle}>{vaccineName}</Text>
          </View>

          {informativos.length === 0 && efeitos.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="information-circle-outline" size={40} color="#ACDAD8" />
              <Text style={styles.emptyText}>Nenhuma informação cadastrada para esta vacina.</Text>
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
                    <Ionicons name="document-text-outline" size={16} color="#666" />
                    <Text style={styles.sourceText}>
                      {informativo.orgaoEmissor} · v{informativo.versao} · {informativo.dataPublicacao}
                    </Text>
                  </View>
                </View>
              ))}

              {efeitos.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Possíveis Reações</Text>
                  {efeitos.map((efeito) => (
                    <View
                      key={efeito.id}
                      style={[styles.efeitoCard, { backgroundColor: SEVERIDADE_COR[efeito.severidade] }]}
                    >
                      <View style={styles.efeitoHeader}>
                        <Ionicons name="alert-circle-outline" size={18} color={SEVERIDADE_TEXTO[efeito.severidade]} />
                        <Text style={[styles.efeitoSeveridade, { color: SEVERIDADE_TEXTO[efeito.severidade] }]}>
                          {efeito.severidade}
                        </Text>
                      </View>
                      <Text style={styles.efeitoDescricao}>{efeito.descricao}</Text>
                      <Text style={styles.efeitoOrientacao}>{efeito.orientacao}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          <View style={styles.recommendationBox}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
            <Text style={styles.recommendationText}>
              Sempre consulte um profissional de saúde para dúvidas sobre vacinação e seu cronograma específico.
            </Text>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      <StatusBar style="auto" />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: '10%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#29442dff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  mainInfo: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 24,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vaccineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#29442dff',
    marginTop: 12,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#29442dff',
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  sectionContent: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  sourceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sourceText: {
    fontSize: 11,
    color: '#888',
  },
  efeitoCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  efeitoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  efeitoSeveridade: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  efeitoDescricao: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
  },
  efeitoOrientacao: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  recommendationBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    marginTop: 8,
    marginBottom: '11%',
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 18,
  },
});
