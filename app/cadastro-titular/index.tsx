import { StatusBar } from 'expo-status-bar';
import {
  Image,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cadastrarTitular, logout } from '../../src/service/authService';
import { useAppContext } from '../../src/context/AppContext';
import { useTheme } from '../../src/context/ThemeContext';
import { joinAddress } from '../../src/utils/address';
import { sanitizeName } from '../../src/utils/nameSanitizer';
import {
  sanitizeStreet,
  sanitizeStreetNumber,
  sanitizeComplement,
  sanitizeNeighborhood,
  sanitizeCity,
} from '../../src/utils/addressSanitizers';
import { minBirthDate } from '../../src/utils/dateBounds';
import { formatCep, formatCns, formatCpf, formatPhone } from '../../src/utils/format';
import { useKeyboardHeight } from '../../src/hooks/useKeyboardHeight';
import { useScrollToFocusedInput } from '../../src/hooks/useScrollToFocusedInput';
import { DateField } from '../../components/redesign';
import { makeStyles } from './styles';

const ESTADO_OPTIONS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'] as const;
type EstadoUF = typeof ESTADO_OPTIONS[number];

const DRAFT_KEY = 'locvac:cadastro-titular:draft';
const TOTAL_STEPS = 2;

export default function CadastroTitular() {
  const router = useRouter();
  const { loadAll, reset } = useAppContext();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState<string>('');
  const [cpf, setCpf] = useState('');
  const [cns, setCns] = useState('');
  const [sexoBiologico, setSexoBiologico] = useState<'MASCULINO' | 'FEMININO' | ''>('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [estado, setEstado] = useState<EstadoUF | ''>('');
  const [showStatePicker, setShowStatePicker] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [draftReady, setDraftReady] = useState(false);

  type FieldKey = 'nome' | 'dataNascimento' | 'cpf' | 'cns' | 'sexoBiologico' | 'cep' | 'telefone';
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const clearError = (field: FieldKey) =>
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

  const lastFetchedCep = useRef<string>('');
  const keyboardHeight = useKeyboardHeight();
  const { scrollRef, onScroll, bindFocus, currentScrollY } = useScrollToFocusedInput();

  const nomeRef = useRef<TextInput>(null);
  const cpfRef = useRef<TextInput>(null);
  const cnsRef = useRef<TextInput>(null);
  const cepRef = useRef<TextInput>(null);
  const telefoneRef = useRef<TextInput>(null);
  const dataNascimentoRef = useRef<View>(null);
  const sexoBiologicoRef = useRef<View>(null);

  const FIELD_ORDER: FieldKey[] = ['nome', 'dataNascimento', 'cpf', 'cns', 'sexoBiologico', 'cep', 'telefone'];

  const scrollToFirstError = (currentErrors: Partial<Record<FieldKey, string>>) => {
    const firstField = FIELD_ORDER.find((f) => currentErrors[f]);
    if (!firstField) return;
    const refMap: Record<FieldKey, React.RefObject<any>> = {
      nome: nomeRef,
      dataNascimento: dataNascimentoRef,
      cpf: cpfRef,
      cns: cnsRef,
      sexoBiologico: sexoBiologicoRef,
      cep: cepRef,
      telefone: telefoneRef,
    };
    const ref = refMap[firstField];
    const scroll = scrollRef.current;
    if (!ref?.current || !scroll) return;
    setTimeout(() => {
      try {
        (ref.current as any).measure?.(
          (_x: number, _y: number, _w: number, h: number, _pageX: number, pageY: number) => {
            const screenHeight = Dimensions.get('window').height;
            const inputCenter = pageY + h / 2;
            const targetCenter = screenHeight / 2;
            const delta = inputCenter - targetCenter;
            scroll.scrollTo({
              y: Math.max(0, currentScrollY.current + delta),
              animated: true,
            });
          },
        );
      } catch {}
    }, 80);
  };

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(DRAFT_KEY);
        if (raw) {
          const d = JSON.parse(raw) as Partial<{
            nome: string; telefone: string; dataNascimento: string; cpf: string; cns: string;
            sexoBiologico: 'MASCULINO' | 'FEMININO' | ''; cep: string; rua: string; numero: string;
            complemento: string; bairro: string; municipio: string; estado: EstadoUF | '';
            step: 1 | 2;
          }>;
          if (d.nome) setNome(d.nome);
          if (d.telefone) setTelefone(d.telefone);
          if (d.dataNascimento) setDataNascimento(d.dataNascimento);
          if (d.cpf) setCpf(d.cpf);
          if (d.cns) setCns(d.cns);
          if (d.sexoBiologico) setSexoBiologico(d.sexoBiologico);
          if (d.cep) setCep(d.cep);
          if (d.rua) setRua(d.rua);
          if (d.numero) setNumero(d.numero);
          if (d.complemento) setComplemento(d.complemento);
          if (d.bairro) setBairro(d.bairro);
          if (d.municipio) setMunicipio(d.municipio);
          if (d.estado) setEstado(d.estado);
          if (d.step === 1 || d.step === 2) setStep(d.step);
        }
      } catch {}
      setDraftReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    const draft = {
      nome, telefone, dataNascimento, cpf, cns, sexoBiologico,
      cep, rua, numero, complemento, bairro, municipio, estado, step,
    };
    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft)).catch(() => {});
  }, [draftReady, nome, telefone, dataNascimento, cpf, cns, sexoBiologico,
      cep, rua, numero, complemento, bairro, municipio, estado, step]);

  const fetchCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    if (lastFetchedCep.current === digits) return;
    lastFetchedCep.current = digits;
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`).catch(() => null);
    if (!response?.ok) return;
    const data = await response.json().catch(() => null);
    if (!data || data.erro) return;
    if (data.logradouro) setRua(data.logradouro);
    if (data.bairro) setBairro(data.bairro);
    if (data.localidade) setMunicipio(data.localidade);
    if (data.uf) setEstado(data.uf as EstadoUF);
  };

  const isCpfValido = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;
    const calcDv = (slice: string, factorStart: number) => {
      let soma = 0;
      for (let i = 0; i < slice.length; i++) soma += Number(slice.charAt(i)) * (factorStart - i);
      const resto = (soma * 10) % 11;
      return resto === 10 ? 0 : resto;
    };
    const dv1 = calcDv(digits.substring(0, 9), 10);
    if (dv1 !== Number(digits.charAt(9))) return false;
    const dv2 = calcDv(digits.substring(0, 10), 11);
    return dv2 === Number(digits.charAt(10));
  };

  const isCnsValido = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 15) return false;
    const primeiro = digits.charAt(0);
    if ('789'.includes(primeiro)) {
      let soma = 0;
      for (let i = 0; i < 15; i++) soma += Number(digits.charAt(i)) * (15 - i);
      return soma % 11 === 0;
    }
    if ('12'.includes(primeiro)) {
      const pis = digits.substring(0, 11);
      let soma = 0;
      for (let i = 0; i < 11; i++) soma += Number(pis.charAt(i)) * (15 - i);
      const resto = soma % 11;
      let dv = 11 - resto;
      let esperado: string;
      if (dv === 11) {
        esperado = pis + '0000';
      } else if (dv === 10) {
        const soma2 = soma + 2;
        const dv2 = 11 - (soma2 % 11);
        esperado = pis + '001' + dv2;
      } else {
        esperado = pis + '000' + dv;
      }
      return digits === esperado;
    }
    return false;
  };

  const handleVoltarLogin = () => {
    if (loading || loggingOut) return;
    Alert.alert(
      'Voltar para o login?',
      'Seu e-mail já está confirmado. Você pode terminar este cadastro depois — basta entrar novamente com o mesmo e-mail.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Voltar',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
            } catch {}
            reset();
            router.replace('/login');
          },
        },
      ],
    );
  };

  const validarEtapa1 = (): boolean => {
    const novoErros: Partial<Record<FieldKey, string>> = {};
    if (!nome.trim()) novoErros.nome = 'Campo obrigatório!';
    if (!dataNascimento.trim()) novoErros.dataNascimento = 'Campo obrigatório!';
    const cpfDigits = cpf.replace(/\D/g, '');
    if (!cpfDigits) novoErros.cpf = 'Campo obrigatório!';
    else if (!isCpfValido(cpfDigits)) novoErros.cpf = 'CPF inválido!';
    const cnsDigits = cns.replace(/\D/g, '');
    if (cnsDigits && !isCnsValido(cnsDigits)) novoErros.cns = 'CNS inválido!';
    if (!sexoBiologico) novoErros.sexoBiologico = 'Campo obrigatório!';
    const telDigits = telefone.replace(/\D/g, '');
    if (!telDigits) novoErros.telefone = 'Campo obrigatório!';
    else if (telDigits.length < 10) novoErros.telefone = 'Telefone inválido!';
    if (Object.keys(novoErros).length > 0) {
      setErrors(novoErros);
      scrollToFirstError(novoErros);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleAvancar = () => {
    if (!validarEtapa1()) return;
    setStep(2);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleVoltarEtapa = () => {
    setStep(1);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const goToStep1WithError = (field: FieldKey, message: string) => {
    const novoErros = { [field]: message } as Partial<Record<FieldKey, string>>;
    setErrors(novoErros);
    setStep(1);
    scrollToFirstError(novoErros);
  };

  const handleSalvar = async () => {
    if (!validarEtapa1()) {
      setStep(1);
      return;
    }
    const novoErros: Partial<Record<FieldKey, string>> = {};
    if (cep.replace(/\D/g, '').length !== 8) novoErros.cep = 'Campo obrigatório!';
    if (Object.keys(novoErros).length > 0) {
      setErrors(novoErros);
      scrollToFirstError(novoErros);
      return;
    }
    setErrors({});

    const cnsDigits = cns.replace(/\D/g, '');

    setLoading(true);
    try {
      await cadastrarTitular({
        nome: nome.trim(),
        telefone: telefone.replace(/\D/g, ''),
        dataNascimento: dataNascimento,
        cpf: cpf.replace(/\D/g, ''),
        cns: cnsDigits || undefined,
        sexoBiologico: sexoBiologico as 'MASCULINO' | 'FEMININO',
        cep: cep.replace(/\D/g, ''),
        rua: joinAddress(rua, numero),
        complemento: complemento.trim(),
        bairro: bairro.trim(),
        municipio: municipio.trim(),
        estado: estado || undefined,
      });
      await AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
      await loadAll();
      router.replace('/home');
    } catch (error: any) {
      const status = error?.response?.status;
      const detail: string = error?.response?.data?.detail ?? '';

      if (status === 400) {
        goToStep1WithError('cpf', 'CPF inválido!');
        return;
      }
      if (status === 409 && detail.includes('CPF')) {
        goToStep1WithError('cpf', 'Este CPF já está cadastrado.');
        return;
      }
      if (status === 409 && detail.includes('CNS')) {
        goToStep1WithError('cns', 'Este CNS já está cadastrado.');
        return;
      }
      const message = status === 409
        ? 'Você já tem um titular cadastrado.'
        : 'Erro ao salvar. Verifique os dados e tente novamente.';
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
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + keyboardHeight }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.logoContainer}>
            <Image
              source={isDark ? require('../../assets/images/logodark.png') : require('../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>{step === 1 ? 'Seus dados' : 'Onde você mora'}</Text>
            <Text style={styles.brandSub}>
              {step === 1 ? 'Vamos começar pelas informações pessoais' : 'Agora precisamos do seu endereço'}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepIndicatorText}>Etapa {step} de {TOTAL_STEPS}</Text>
              <View style={styles.stepBarTrack}>
                <View style={[styles.stepBarFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
              </View>
            </View>
            <Text style={styles.legend}>
              Campos com <Text style={styles.required}>*</Text> são obrigatórios
            </Text>
            {step === 1 && (<>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Nome completo <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={nomeRef}
                style={[styles.input, errors.nome && styles.inputError]}
                value={nome}
                onChangeText={(v) => { setNome(sanitizeName(v)); clearError('nome'); }}
                onFocus={bindFocus(nomeRef)}
                placeholder="Digite seu nome"
                placeholderTextColor={colors.ink3}
                maxLength={100}
                autoCapitalize="words"
              />
              {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Data de nascimento <Text style={styles.required}>*</Text>
              </Text>
              <View ref={dataNascimentoRef}>
                <DateField
                  value={dataNascimento}
                  onChange={(iso) => { setDataNascimento(iso); clearError('dataNascimento'); }}
                  error={!!errors.dataNascimento}
                  maximumDate={new Date()}
                  minimumDate={minBirthDate()}
                />
              </View>
              {errors.dataNascimento && <Text style={styles.errorText}>{errors.dataNascimento}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                CPF <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={cpfRef}
                style={[styles.input, errors.cpf && styles.inputError]}
                value={cpf}
                onChangeText={(v) => { setCpf(formatCpf(v)); clearError('cpf'); }}
                onFocus={bindFocus(cpfRef)}
                placeholder="000.000.000-00"
                placeholderTextColor={colors.ink3}
                keyboardType="numeric"
                maxLength={14}
              />
              {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CNS</Text>
              <TextInput
                ref={cnsRef}
                style={[styles.input, errors.cns && styles.inputError]}
                value={cns}
                onChangeText={(v) => { setCns(formatCns(v)); clearError('cns'); }}
                onFocus={bindFocus(cnsRef)}
                placeholder="000 0000 0000 0000"
                placeholderTextColor={colors.ink3}
                keyboardType="numeric"
                maxLength={18}
              />
              {errors.cns && <Text style={styles.errorText}>{errors.cns}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Sexo biológico <Text style={styles.required}>*</Text>
              </Text>
              <View ref={sexoBiologicoRef} style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  style={[
                    styles.sexChip,
                    sexoBiologico === 'MASCULINO' && styles.sexChipActive,
                    errors.sexoBiologico && !sexoBiologico && styles.inputError,
                  ]}
                  onPress={() => { setSexoBiologico('MASCULINO'); clearError('sexoBiologico'); }}
                >
                  <Text style={[styles.sexChipText, sexoBiologico === 'MASCULINO' && styles.sexChipTextActive]}>Masculino</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.sexChip,
                    sexoBiologico === 'FEMININO' && styles.sexChipActive,
                    errors.sexoBiologico && !sexoBiologico && styles.inputError,
                  ]}
                  onPress={() => { setSexoBiologico('FEMININO'); clearError('sexoBiologico'); }}
                >
                  <Text style={[styles.sexChipText, sexoBiologico === 'FEMININO' && styles.sexChipTextActive]}>Feminino</Text>
                </Pressable>
              </View>
              {errors.sexoBiologico && <Text style={styles.errorText}>{errors.sexoBiologico}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Telefone <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={telefoneRef}
                style={[styles.input, errors.telefone && styles.inputError]}
                value={telefone}
                onChangeText={(v) => { setTelefone(formatPhone(v)); clearError('telefone'); }}
                onFocus={bindFocus(telefoneRef)}
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.ink3}
                maxLength={15}
                keyboardType="phone-pad"
              />
              {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
            </View>
            </>)}

            {step === 2 && (<>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                CEP <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={cepRef}
                style={[styles.input, errors.cep && styles.inputError]}
                value={cep}
                onChangeText={(v) => {
                  const formatted = formatCep(v);
                  setCep(formatted);
                  clearError('cep');
                  if (formatted.replace(/\D/g, '').length === 8) fetchCep(formatted);
                }}
                onFocus={bindFocus(cepRef)}
                placeholder="00000-000"
                placeholderTextColor={colors.ink3}
                keyboardType="numeric"
                maxLength={9}
              />
              {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Rua</Text>
              <TextInput
                style={styles.input}
                value={rua}
                onChangeText={(v) => setRua(sanitizeStreet(v))}
                placeholder="Nome da rua"
                placeholderTextColor={colors.ink3}
                maxLength={200}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Número</Text>
              <TextInput
                style={styles.input}
                value={numero}
                onChangeText={(v) => setNumero(sanitizeStreetNumber(v))}
                placeholder="Ex: 123"
                placeholderTextColor={colors.ink3}
                maxLength={20}
                keyboardType="default"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Complemento</Text>
              <TextInput
                style={styles.input}
                value={complemento}
                onChangeText={(v) => setComplemento(sanitizeComplement(v))}
                placeholder="Apto, bloco, etc."
                placeholderTextColor={colors.ink3}
                maxLength={100}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bairro</Text>
              <TextInput
                style={styles.input}
                value={bairro}
                onChangeText={(v) => setBairro(sanitizeNeighborhood(v))}
                placeholder="Nome do bairro"
                placeholderTextColor={colors.ink3}
                maxLength={100}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Município</Text>
              <TextInput
                style={styles.input}
                value={municipio}
                onChangeText={(v) => setMunicipio(sanitizeCity(v))}
                placeholder="Nome da cidade"
                placeholderTextColor={colors.ink3}
                maxLength={100}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Estado</Text>
              <Pressable
                style={[styles.input, styles.pickerButton]}
                onPress={() => setShowStatePicker(!showStatePicker)}
              >
                <Text style={{ color: estado ? colors.ink : colors.ink3, fontSize: 14 }}>
                  {estado || 'Selecione o estado'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.brandInk} />
              </Pressable>
              {showStatePicker && (
                <ScrollView style={styles.pickerDropdown} nestedScrollEnabled>
                  {ESTADO_OPTIONS.map((uf) => (
                    <Pressable
                      key={uf}
                      style={[styles.pickerOption, estado === uf && styles.pickerOptionActive]}
                      onPress={() => { setEstado(uf); setShowStatePicker(false); }}
                    >
                      <Text style={[styles.pickerOptionText, estado === uf && styles.pickerOptionTextActive]}>
                        {uf}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
            </>)}

            {step === 1 ? (
              <Pressable
                style={[styles.submitButton, (loading || loggingOut) && styles.submitButtonDisabled]}
                onPress={handleAvancar}
                disabled={loading || loggingOut}
              >
                <Text style={styles.submitButtonText}>Continuar</Text>
              </Pressable>
            ) : (
              <View style={styles.stepActions}>
                <Pressable
                  style={[styles.stepBackButton, (loading || loggingOut) && styles.submitButtonDisabled]}
                  onPress={handleVoltarEtapa}
                  disabled={loading || loggingOut}
                >
                  <Ionicons name="chevron-back" size={16} color={colors.brandInk} />
                  <Text style={styles.stepBackButtonText}>Voltar</Text>
                </Pressable>
                <Pressable
                  style={[styles.submitButton, styles.stepSubmitButton, (loading || loggingOut) && styles.submitButtonDisabled]}
                  onPress={handleSalvar}
                  disabled={loading || loggingOut}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Concluir cadastro</Text>
                  )}
                </Pressable>
              </View>
            )}

            <Pressable
              onPress={handleVoltarLogin}
              disabled={loading || loggingOut}
              style={styles.backButton}
            >
              {loggingOut ? (
                <ActivityIndicator color={colors.brandInk} size="small" />
              ) : (
                <View style={styles.backRow}>
                  <Ionicons name="chevron-back" size={14} color={colors.brandInk} />
                  <Text style={styles.backText}>Voltar para o login</Text>
                </View>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
