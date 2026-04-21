import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { fetchCarrosselConteudo } from '../../service/infoService';
import { CarrosselConteudoDTO } from '../../types/info';

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#29442dff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{titulo}</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#29442dff" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#29442dff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  secaoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#29442dff',
    marginBottom: 8,
  },
  secaoConteudo: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  itensList: {
    marginTop: 4,
    gap: 8,
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
    backgroundColor: '#29442dff',
    marginTop: 6,
  },
  itemTexto: {
    flex: 1,
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
  },
});
