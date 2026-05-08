import { StatusBar } from 'expo-status-bar';
import {
  Animated,
  Easing,
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
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { login, iniciarCadastro } from './service/authService';
import { useAppContext } from './context/AppContext';
import { colors, radii, shadows, typography } from './theme/tokens';

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

  type LoginFieldKey = 'email' | 'senha' | 'confirmarSenha';
  const [errors, setErrors] = useState<Partial<Record<LoginFieldKey, string>>>({});
  const clearError = (field: LoginFieldKey) =>
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

  const scrollRef = useRef<ScrollView>(null);
  const focusedInputRef = useRef<TextInput | null>(null);
  const currentScrollY = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const confirmarSenhaRef = useRef<TextInput>(null);

  const modeAnim = useRef(new Animated.Value(0)).current;
  const [tabWidth, setTabWidth] = useState(0);
  const [extraFieldHeight, setExtraFieldHeight] = useState(110);

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
    setErrors({});
  };

  const switchMode = (newMode: Mode) => {
    resetFields();
    setMode(newMode);
    Animated.timing(modeAnim, {
      toValue: newMode === 'cadastro' ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const handleLogin = async () => {
    const novoErros: Partial<Record<LoginFieldKey, string>> = {};
    if (!email.trim()) novoErros.email = 'Campo obrigatório!';
    if (!senha.trim()) novoErros.senha = 'Campo obrigatório!';
    if (Object.keys(novoErros).length > 0) {
      setErrors(novoErros);
      return;
    }
    setErrors({});

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
    const novoErros: Partial<Record<LoginFieldKey, string>> = {};
    if (!email.trim()) novoErros.email = 'Campo obrigatório!';
    if (!senha.trim()) novoErros.senha = 'Campo obrigatório!';
    if (!confirmarSenha.trim()) novoErros.confirmarSenha = 'Campo obrigatório!';
    if (Object.keys(novoErros).length > 0) {
      setErrors(novoErros);
      return;
    }
    setErrors({});

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
    <LinearGradient
      colors={[colors.brandSoft, colors.bgMuted]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
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
              source={require('../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>LocVac</Text>
            <Text style={styles.brandSub}>Sua carteira de vacinação digital</Text>
          </View>

          <View style={styles.card}>
            <View
              style={styles.tabRow}
              onLayout={(e) => {
                const totalWidth = e.nativeEvent.layout.width;
                setTabWidth((totalWidth - 8) / 2);
              }}
            >
              {tabWidth > 0 && (
                <View
                  pointerEvents="none"
                  style={[
                    styles.tabIndicator,
                    { width: tabWidth, left: mode === 'cadastro' ? tabWidth + 4 : 4 },
                  ]}
                />
              )}
              <Pressable style={styles.tab} onPress={() => switchMode('login')}>
                <Text style={[styles.tabText, { color: mode === 'login' ? '#ffffff' : colors.ink3 }]}>
                  Entrar
                </Text>
              </Pressable>
              <Pressable style={styles.tab} onPress={() => switchMode('cadastro')}>
                <Text style={[styles.tabText, { color: mode === 'cadastro' ? '#ffffff' : colors.ink3 }]}>
                  Criar conta
                </Text>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={18} color={colors.ink3} style={styles.leadingIcon} />
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  value={email}
                  onChangeText={(v) => { setEmail(v); clearError('email'); }}
                  onFocus={focusFor(emailRef)}
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.ink3}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={[styles.inputWrap, errors.senha && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.ink3} style={styles.leadingIcon} />
                <TextInput
                  ref={senhaRef}
                  style={styles.input}
                  value={senha}
                  onChangeText={(v) => { setSenha(v); clearError('senha'); }}
                  onFocus={focusFor(senhaRef)}
                  placeholder="••••••••"
                  placeholderTextColor={colors.ink3}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.ink3}
                  />
                </Pressable>
              </View>
              {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
            </View>

            <Animated.View
              style={{
                maxHeight: modeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, extraFieldHeight],
                }),
                opacity: modeAnim,
                overflow: 'hidden',
              }}
            >
              <View
                style={styles.fieldGroup}
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height;
                  if (h > 0 && Math.abs(h - extraFieldHeight) > 2) {
                    setExtraFieldHeight(h);
                  }
                }}
              >
                <Text style={styles.label}>Confirmar senha</Text>
                <View style={[styles.inputWrap, errors.confirmarSenha && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.ink3} style={styles.leadingIcon} />
                  <TextInput
                    ref={confirmarSenhaRef}
                    style={styles.input}
                    value={confirmarSenha}
                    onChangeText={(v) => { setConfirmarSenha(v); clearError('confirmarSenha'); }}
                    onFocus={focusFor(confirmarSenhaRef)}
                    placeholder="Repita a senha"
                    placeholderTextColor={colors.ink3}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={mode === 'cadastro'}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={colors.ink3}
                    />
                  </Pressable>
                </View>
                {errors.confirmarSenha && <Text style={styles.errorText}>{errors.confirmarSenha}</Text>}
              </View>
            </Animated.View>

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

            <Animated.View
              style={{
                maxHeight: modeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [44, 0],
                }),
                opacity: modeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                overflow: 'hidden',
              }}
            >
              <Pressable
                style={styles.forgotButton}
                onPress={() => router.push('/esqueci-senha')}
                disabled={mode !== 'login'}
              >
                <Text style={styles.forgotText}>Esqueci minha senha</Text>
              </Pressable>
            </Animated.View>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 22,
    paddingTop: 72,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 14,
  },
  brandTitle: {
    ...typography.h2,
    fontSize: 28,
    color: colors.ink,
  },
  brandSub: {
    fontSize: 12,
    color: colors.ink3,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: colors.bgElev,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 22,
    ...shadows.md,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgMuted,
    borderRadius: radii.md,
    padding: 4,
    marginBottom: 20,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: colors.brand,
    borderRadius: radii.sm + 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radii.sm + 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    ...typography.labelCap,
    color: colors.ink2,
    textTransform: 'none',
    letterSpacing: 0.2,
    fontSize: 12,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgMuted,
    borderRadius: radii.md - 1,
    borderWidth: 1,
    borderColor: colors.line,
  },
  leadingIcon: {
    marginLeft: 12,
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.ink,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  errorText: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: colors.brand,
    borderRadius: radii.md,
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
    color: colors.brand,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 22,
  },
  footerText: {
    fontSize: 13,
    color: colors.ink2,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand,
  },
});
