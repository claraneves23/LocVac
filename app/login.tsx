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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { login, iniciarCadastro } from './service/authService';
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
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const scrollRef = useRef<ScrollView>(null);
  const focusedInputRef = useRef<TextInput | null>(null);
  const currentScrollY = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const confirmarSenhaRef = useRef<TextInput>(null);

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
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const focusFor = (ref: React.RefObject<TextInput | null>) => () => {
    focusedInputRef.current = ref.current;
  };

  const resetFields = () => {
    setEmail('');
    setSenha('');
    setConfirmarSenha('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = (newMode: Mode) => {
    resetFields();
    setMode(newMode);
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
    if (!email.trim() || !senha.trim() || !confirmarSenha.trim()) {
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

    setLoading(true);
    try {
      await iniciarCadastro({ email: email.trim(), senha });
      router.push({ pathname: '/verificar-email', params: { email: email.trim().toLowerCase() } });
    } catch (error: any) {
      const message =
        error?.response?.status === 409
          ? 'Este e-mail já está cadastrado.'
          : 'Erro ao iniciar cadastro. Verifique sua conexão.';
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
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 40 + keyboardHeight },
          ]}
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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                ref={emailRef}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onFocus={focusFor(emailRef)}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={senhaRef}
                  style={styles.passwordInput}
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={focusFor(senhaRef)}
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
                    ref={confirmarSenhaRef}
                    style={styles.passwordInput}
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    onFocus={focusFor(confirmarSenhaRef)}
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
              <Pressable style={styles.forgotButton} onPress={() => router.push('/esqueci-senha')}>
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
