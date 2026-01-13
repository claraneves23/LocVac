import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomBar } from '../../components/BottomBar';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Effect {
  title: string;
  description: string;
  severity: string;
  icon: IconName;
}

export default function SideEffects() {
  const router = useRouter();

  const commonEffects: Effect[] = [
    {
      title: 'Inchaço ou Vermelhidão no Local da Injeção',
      description: 'A reação mais comum. Geralmente desaparece em poucos dias.',
      severity: 'Leve',
      icon: 'water-outline',
    },
    {
      title: 'Febre Baixa',
      description: 'Pode ocorrer 1-2 dias após a vacinação. É sinal de que o sistema imunológico está respondendo.',
      severity: 'Leve',
      icon: 'thermometer-outline',
    },
    {
      title: 'Irritabilidade ou Sonolência',
      description: 'Comum em bebês após vacinação. Volta ao normal em poucas horas.',
      severity: 'Leve',
      icon: 'sad-outline',
    },
    {
      title: 'Dor ou Desconforto',
      description: 'Pode haver sensibilidade no local da injeção ao toque ou movimento.',
      severity: 'Leve',
      icon: 'alert-circle-outline',
    },
  ];

  const rareEffects = [
    {
      title: 'Reação Alérgica Grave',
      description: 'Extremamente rara. Inclui dificuldade respiratória ou inchaço facial.',
      severity: 'Grave',
      action: 'Procure emergência imediatamente',
    },
    {
      title: 'Síncope (Desmaio)',
      description: 'Pode ocorrer logo após a vacinação por motivos psicológicos.',
      severity: 'Moderado',
      action: 'Mantenha-se deitado ou sentado',
    },
  ];

  const managementTips = [
    'Aplique uma compressa fria no local da injeção para reduzir o inchaço',
    'Mantenha a criança hidratada',
    'Use medicamentos para febre conforme orientação médica',
    'Observe a criança por 15 minutos após a vacinação',
    'Evite atividades muito intensas no dia da vacinação',
    'Procure atendimento se a reação persistir por mais de 3 dias',
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#29442dff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Efeitos Colaterais</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introBox}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF9800" />
          <Text style={styles.introTitle}>Reações às Vacinas</Text>
          <Text style={styles.introText}>
            A maioria das reações é leve e temporária. Conheça o que esperar e como cuidar.
          </Text>
        </View>

        {/* Efeitos Comuns */}
        <Text style={styles.sectionTitle}>Reações Comuns (Geralmente Leves)</Text>
        {commonEffects.map((effect, index) => (
          <View key={index} style={styles.effectCard}>
            <View style={styles.effectHeader}>
              <Ionicons name={effect.icon} size={24} color="#29442dff" />
              <View style={styles.effectTitle}>
                <Text style={styles.effectName}>{effect.title}</Text>
                <View style={styles.severityTag}>
                  <Text style={styles.severityText}>{effect.severity}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.effectDescription}>{effect.description}</Text>
          </View>
        ))}

        {/* Reações Raras */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Reações Raras (Muito Infrequentes)</Text>
        {rareEffects.map((effect, index) => (
          <View key={index} style={[styles.effectCard, styles.rareCard]}>
            <View style={styles.effectHeader}>
              <Ionicons name="warning-outline" size={24} color="#D32F2F" />
              <View style={styles.effectTitle}>
                <Text style={styles.effectName}>{effect.title}</Text>
                <View style={styles.severityTagRare}>
                  <Text style={styles.severityTextRare}>{effect.severity}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.effectDescription}>{effect.description}</Text>
            <View style={styles.actionBox}>
              <Ionicons name="alert-outline" size={16} color="#D32F2F" />
              <Text style={styles.actionText}>{effect.action}</Text>
            </View>
          </View>
        ))}

        {/* Dicas de Manejo */}
        <View style={styles.managementSection}>
          <Text style={styles.sectionTitle}>Como Cuidar Após a Vacinação</Text>
          {managementTips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Quando Procurar Ajuda */}
        <View style={styles.warningBox}>
          <Ionicons name="call-outline" size={24} color="#C62828" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Procure Ajuda Médica Se:</Text>
            <Text style={styles.warningText}>
              • Febre acima de 40°C persistente{'\n'}
              • Dificuldade respiratória{'\n'}
              • Inchaço facial ou na garganta{'\n'}
              • Convulsões{'\n'}
              • Reações que durarem mais de 3 dias
            </Text>
          </View>
        </View>

        {/* Informação importante */}
        <View style={styles.importantBox}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
          <Text style={styles.importantText}>
            Os benefícios das vacinas superam amplamente o risco de reações adversas. A imunização é a melhor forma de proteger contra doenças graves.
          </Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <BottomBar />
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#29442dff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  introBox: {
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
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#29442dff',
    marginTop: 12,
  },
  introText: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 16,
    marginTop: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#29442dff',
    marginBottom: 12,
    marginTop: 16,
  },
  effectCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderLeftColor: '#FF9800',
    borderLeftWidth: 4,
  },
  rareCard: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#D32F2F',
  },
  effectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  effectTitle: {
    flex: 1,
  },
  effectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  severityTag: {
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E65100',
  },
  severityTagRare: {
    backgroundColor: '#FFCDD2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  severityTextRare: {
    fontSize: 10,
    fontWeight: '600',
    color: '#C62828',
  },
  effectDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  actionBox: {
    flexDirection: 'row',
    backgroundColor: '#FFCDD2',
    padding: 8,
    borderRadius: 6,
    gap: 8,
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: 12,
    color: '#C62828',
    fontWeight: '500',
  },
  managementSection: {
    marginVertical: 16,
  },
  tipItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    alignItems: 'flex-start',
    gap: 12,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#29442dff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  tipNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFCDD2',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    marginVertical: 20,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 12,
    color: '#B71C1C',
    lineHeight: 16,
  },
  importantBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    marginVertical: 20,
  },
  importantText: {
    flex: 1,
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 16,
  },
});
