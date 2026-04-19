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
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { login, cadastrar } from './service/authService';
import { useAppContext } from './context/AppContext';

type Mode = 'login' | 'cadastro';

export default function Login() {
  const router = useRouter();
  const { loadAll } = useAppContext();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [dataNascimento, setDataNascimento] = useState<Date | undefined>(undefined);
  const [cpf, setCpf] = useState('');
  const [sexoBiologico, setSexoBiologico] = useState<'MASCULINO' | 'FEMININO' | ''>('');
  const [cep, setCep] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const resetFields = () => {
    setEmail('');
    setSenha('');
    setNome('');
    setTelefone('');
    setConfirmarSenha('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = (newMode: Mode) => {
    resetFields();
    setMode(newMode);
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), senha });
      await loadAll();
      router.replace('/');
    } catch (error: any) {
      const message =
        error?.response?.status === 401
          ? 'E-mail ou senha incorretos.'
          : error?.response?.status === 423
            ? 'Conta bloqueada temporariamente. Tente novamente mais tarde.'
            : 'Erro ao fazer login. Verifique sua conexão.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = async () => {

    if (!nome.trim() || !email.trim() || !senha.trim() || !telefone.trim() || !dataNascimento || !cpf.trim() || !sexoBiologico || !cep.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Senhas diferentes', 'As senhas não coincidem.');
      return;
    }

    const payload = {
      nome: nome.trim(),
      email: email.trim(),
      senha,
      telefone: telefone.replace(/\D/g, ''),
      dataNascimento: dataNascimento?.toISOString().split('T')[0],
      cpf: cpf.replace(/\D/g, ''),
      sexoBiologico,
      cep: cep.replace(/\D/g, ''),
    };
    console.log('Payload enviado para cadastro:', payload);
    setLoading(true);
    try {
      await cadastrar(payload);
      Alert.alert('Conta criada!', 'Faça login para continuar.', [
        { text: 'OK', onPress: () => switchMode('login') },
      ]);
    } catch (error: any) {
      const message =
        error?.response?.status === 409
          ? 'Este e-mail já está cadastrado.'
          : 'Erro ao criar conta. Verifique sua conexão.';
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/locvaclogo-trim.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <View style={styles.tabRow}>
              <Pressable
                style={[styles.tab, mode === 'login' && styles.tabActive]}
                onPress={() => switchMode('login')}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                  Entrar
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, mode === 'cadastro' && styles.tabActive]}
                onPress={() => switchMode('cadastro')}
              >
                <Text style={[styles.tabText, mode === 'cadastro' && styles.tabTextActive]}>
                  Criar conta
                </Text>
              </Pressable>
            </View>

            {mode === 'cadastro' && (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Nome completo</Text>
                  <TextInput
                    style={styles.input}
                    value={nome}
                    onChangeText={setNome}
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
                    style={styles.input}
                    value={cpf}
                    onChangeText={setCpf}
                    placeholder="Digite seu CPF"
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
                    style={styles.input}
                    value={cep}
                    onChangeText={setCep}
                    placeholder="Digite seu CEP"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={9}
                  />
                </View>
              </>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {mode === 'cadastro' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  value={telefone}
                  onChangeText={(v) => setTelefone(formatPhone(v))}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#607367"
                  />
                </Pressable>
              </View>
            </View>

            {mode === 'cadastro' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirmar senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    placeholder="Repita a senha"
                    placeholderTextColor="#999"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#607367"
                    />
                  </Pressable>
                </View>
              </View>
            )}

            <Pressable
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={mode === 'login' ? handleLogin : handleCadastro}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === 'login' ? 'Entrar' : 'Criar conta'}
                </Text>
              )}
            </Pressable>

            {mode === 'login' && (
              <Pressable style={styles.forgotButton}>
                <Text style={styles.forgotText}>Esqueci minha senha</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </Text>
            <Pressable onPress={() => switchMode(mode === 'login' ? 'cadastro' : 'login')}>
              <Text style={styles.footerLink}>
                {mode === 'login' ? 'Criar conta' : 'Entrar'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAE3E2',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 80,
  },
  card: {
    backgroundColor: '#ffffffcc',
    borderRadius: 16,
    padding: 20,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F2F7F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#29442dff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#607367',
  },
  tabTextActive: {
    color: '#fff',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f3322',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F2F7F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f3322',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F7F6',
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f3322',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: '#29442dff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 14,
  },
  forgotText: {
    fontSize: 13,
    color: '#29442dff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#4d5c53',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#29442dff',
  },
});
