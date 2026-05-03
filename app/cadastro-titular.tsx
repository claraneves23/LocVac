import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Keyboard,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { cadastrarTitular } from './service/authService';
import { useAppContext } from './context/AppContext';

export default function CadastroTitular() {
  const router = useRouter();
  const { loadAll } = useAppContext();
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState<Date | undefined>(undefined);
  const [cpf, setCpf] = useState('');
  const [sexoBiologico, setSexoBiologico] = useState<'MASCULINO' | 'FEMININO' | ''>('');
  const [cep, setCep] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const focusedInputRef = useRef<TextInput | null>(null);
  const currentScrollY = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const nomeRef = useRef<TextInput>(null);
  const cpfRef = useRef<TextInput>(null);
  const cepRef = useRef<TextInput>(null);
  const telefoneRef = useRef<TextInput>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      const input = focusedInputRef.current;
      const scroll = scrollRef.current;
      if (!input || !scroll) return;
      setTimeout(() => {
        try {
          (input as any).measure?.(
            (_x: number, _y: number, _w: number, h: number, _pageX: number, pageY: number) => {
              const keyboardTop = e.endCoordinates.screenY;
              const inputBottom = pageY + h + 24;
              if (inputBottom > keyboardTop) {
                const delta = inputBottom - keyboardTop;
                scroll.scrollTo({
                  y: currentScrollY.current + delta,
                  animated: true,
                });
              }
            },
          );
        } catch {}
      }, 100);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const focusFor = (ref: React.RefObject<TextInput | null>) => () => {
    focusedInputRef.current = ref.current;
  };

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSalvar = async () => {
    if (!nome.trim() || !telefone.trim() || !dataNascimento || !cpf.trim() || !sexoBiologico || !cep.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      await cadastrarTitular({
        nome: nome.trim(),
        telefone: telefone.replace(/\D/g, ''),
        dataNascimento: dataNascimento.toISOString().split('T')[0],
        cpf: cpf.replace(/\D/g, ''),
        sexoBiologico,
        cep: cep.replace(/\D/g, ''),
      });
      await loadAll();
      router.replace('/');
    } catch (error: any) {
      const status = error?.response?.status;
      const detail: string = error?.response?.data?.detail ?? '';

      let message: string;
      if (status === 400) {
        message = 'CPF inválido. Verifique o número digitado.';
      } else if (status === 409 && detail.includes('CPF')) {
        message = 'Este CPF já está cadastrado.';
      } else if (status === 409) {
        message = 'Você já tem um titular cadastrado.';
      } else {
        message = 'Erro ao salvar. Verifique os dados e tente novamente.';
      }
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + keyboardHeight }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={(e) => { currentScrollY.current = e.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={16}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/locvaclogo-trim.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Seus dados</Text>
            <Text style={styles.subtitle}>
              Para finalizar o cadastro, preencha as informações do titular da conta.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                ref={nomeRef}
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                onFocus={focusFor(nomeRef)}
                placeholder="Digite seu nome"
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Data de nascimento</Text>
              <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
                <Text style={{ color: dataNascimento ? '#1f3322' : '#999' }}>
                  {dataNascimento ? dataNascimento.toLocaleDateString() : 'Selecione a data'}
                </Text>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={dataNascimento || new Date(2000, 0, 1)}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowDatePicker(false);
                    if (date) setDataNascimento(date);
                  }}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CPF</Text>
              <TextInput
                ref={cpfRef}
                style={styles.input}
                value={cpf}
                onChangeText={(v) => setCpf(formatCpf(v))}
                onFocus={focusFor(cpfRef)}
                placeholder="000.000.000-00"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={14}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Sexo biológico</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Pressable
                  style={[styles.input, { flex: 1, backgroundColor: sexoBiologico === 'MASCULINO' ? '#CAE3E2' : '#F2F7F6' }]}
                  onPress={() => setSexoBiologico('MASCULINO')}
                >
                  <Text style={{ color: '#1f3322', textAlign: 'center' }}>Masculino</Text>
                </Pressable>
                <Pressable
                  style={[styles.input, { flex: 1, backgroundColor: sexoBiologico === 'FEMININO' ? '#CAE3E2' : '#F2F7F6' }]}
                  onPress={() => setSexoBiologico('FEMININO')}
                >
                  <Text style={{ color: '#1f3322', textAlign: 'center' }}>Feminino</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CEP</Text>
              <TextInput
                ref={cepRef}
                style={styles.input}
                value={cep}
                onChangeText={setCep}
                onFocus={focusFor(cepRef)}
                placeholder="Digite seu CEP"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={9}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                ref={telefoneRef}
                style={styles.input}
                value={telefone}
                onChangeText={(v) => setTelefone(formatPhone(v))}
                onFocus={focusFor(telefoneRef)}
                placeholder="(00) 00000-0000"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <Pressable
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSalvar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Concluir cadastro</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CAE3E2' },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 180, height: 80 },
  card: { backgroundColor: '#ffffffcc', borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#1f3322', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#4d5c53', marginBottom: 18 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#1f3322', marginBottom: 6 },
  input: {
    backgroundColor: '#F2F7F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f3322',
  },
  submitButton: {
    backgroundColor: '#29442dff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
