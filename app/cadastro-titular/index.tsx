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
  Keyboard,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { cadastrarTitular, logout } from '../../src/service/authService';
import { useAppContext } from '../../src/context/AppContext';
import { colors } from '../../src/theme/tokens';
import styles from './styles';

const ESTADO_OPTIONS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'] as const;
type EstadoUF = typeof ESTADO_OPTIONS[number];

export default function CadastroTitular() {
  const router = useRouter();
  const { loadAll, reset } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState<Date | undefined>(undefined);
  const [cpf, setCpf] = useState('');
  const [cns, setCns] = useState('');
  const [sexoBiologico, setSexoBiologico] = useState<'MASCULINO' | 'FEMININO' | ''>('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [complemento, setComplemento] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [estado, setEstado] = useState<EstadoUF | ''>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  type FieldKey = 'nome' | 'dataNascimento' | 'cpf' | 'sexoBiologico' | 'cep' | 'telefone';
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const clearError = (field: FieldKey) =>
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

  const nomeRef = useRef<TextInput>(null);
  const cpfRef = useRef<TextInput>(null);
  const cepRef = useRef<TextInput>(null);
  const telefoneRef = useRef<TextInput>(null);
  const dataNascimentoRef = useRef<View>(null);
  const sexoBiologicoRef = useRef<View>(null);

  const FIELD_ORDER: FieldKey[] = ['nome', 'dataNascimento', 'cpf', 'sexoBiologico', 'cep', 'telefone'];

  const scrollToFirstError = (currentErrors: Partial<Record<FieldKey, string>>) => {
    const firstField = FIELD_ORDER.find((f) => currentErrors[f]);
    if (!firstField) return;
    const refMap: Record<FieldKey, React.RefObject<any>> = {
      nome: nomeRef,
      dataNascimento: dataNascimentoRef,
      cpf: cpfRef,
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

  const fetchCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`).catch(() => null);
    if (!response?.ok) return;
    const data = await response.json().catch(() => null);
    if (!data || data.erro) return;
    if (data.logradouro) setRua(data.logradouro);
    if (data.localidade) setMunicipio(data.localidade);
    if (data.uf) setEstado(data.uf as EstadoUF);
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

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const formatCns = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 15);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 11) return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)} ${digits.slice(11)}`;
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

  const handleSalvar = async () => {
    const novoErros: Partial<Record<FieldKey, string>> = {};
    if (!nome.trim()) novoErros.nome = 'Campo obrigatório!';
    if (!dataNascimento) novoErros.dataNascimento = 'Campo obrigatório!';
    if (!cpf.trim()) novoErros.cpf = 'Campo obrigatório!';
    if (!sexoBiologico) novoErros.sexoBiologico = 'Campo obrigatório!';
    if (cep.replace(/\D/g, '').length !== 8) novoErros.cep = 'Campo obrigatório!';
    if (!telefone.trim()) novoErros.telefone = 'Campo obrigatório!';

    if (Object.keys(novoErros).length > 0) {
      setErrors(novoErros);
      scrollToFirstError(novoErros);
      return;
    }
    setErrors({});

    const cnsDigits = cns.replace(/\D/g, '');
    if (cnsDigits && !isCnsValido(cnsDigits)) {
      Alert.alert('Erro', 'CNS inválido. Verifique o número digitado.');
      return;
    }

    setLoading(true);
    try {
      await cadastrarTitular({
        nome: nome.trim(),
        telefone: telefone.replace(/\D/g, ''),
        dataNascimento: dataNascimento!.toISOString().split('T')[0],
        cpf: cpf.replace(/\D/g, ''),
        cns: cnsDigits || undefined,
        sexoBiologico: sexoBiologico as 'MASCULINO' | 'FEMININO',
        cep: cep.replace(/\D/g, ''),
        rua: rua.trim(),
        complemento: complemento.trim(),
        municipio: municipio.trim(),
        estado: estado || undefined,
      });
      await loadAll();
      router.replace('/home');
    } catch (error: any) {
      const status = error?.response?.status;
      const detail: string = error?.response?.data?.detail ?? '';

      let message: string;
      if (status === 400) {
        message = 'CPF inválido. Verifique o número digitado.';
      } else if (status === 409 && detail.includes('CPF')) {
        message = 'Este CPF já está cadastrado.';
      } else if (status === 409 && detail.includes('CNS')) {
        message = 'Este CNS já está cadastrado.';
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
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + keyboardHeight }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={(e) => { currentScrollY.current = e.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={16}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>Seus dados</Text>
            <Text style={styles.brandSub}>Finalize o cadastro do titular</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.legend}>
              Campos com <Text style={styles.required}>*</Text> são obrigatórios
            </Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Nome completo <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={nomeRef}
                style={[styles.input, errors.nome && styles.inputError]}
                value={nome}
                onChangeText={(v) => { setNome(v); clearError('nome'); }}
                onFocus={focusFor(nomeRef)}
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
              <Pressable
                ref={dataNascimentoRef}
                onPress={() => setShowDatePicker(true)}
                style={[styles.input, errors.dataNascimento && styles.inputError]}
              >
                <Text style={{ color: dataNascimento ? colors.ink : colors.ink3, fontSize: 14 }}>
                  {dataNascimento ? dataNascimento.toLocaleDateString() : 'Selecione a data'}
                </Text>
              </Pressable>
              {errors.dataNascimento && <Text style={styles.errorText}>{errors.dataNascimento}</Text>}
              {showDatePicker && (
                <DateTimePicker
                  value={dataNascimento || new Date(2000, 0, 1)}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowDatePicker(false);
                    if (date) { setDataNascimento(date); clearError('dataNascimento'); }
                  }}
                  maximumDate={new Date()}
                />
              )}
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
                onFocus={focusFor(cpfRef)}
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
                style={styles.input}
                value={cns}
                onChangeText={(v) => setCns(formatCns(v))}
                placeholder="000 0000 0000 0000"
                placeholderTextColor={colors.ink3}
                keyboardType="numeric"
                maxLength={18}
              />
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
                CEP <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={cepRef}
                style={[styles.input, errors.cep && styles.inputError]}
                value={cep}
                onChangeText={(v) => { setCep(formatCep(v)); clearError('cep'); }}
                onFocus={focusFor(cepRef)}
                onBlur={() => fetchCep(cep)}
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
                onChangeText={setRua}
                placeholder="Rua e número"
                placeholderTextColor={colors.ink3}
                maxLength={200}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Complemento</Text>
              <TextInput
                style={styles.input}
                value={complemento}
                onChangeText={setComplemento}
                placeholder="Apto, bloco, etc."
                placeholderTextColor={colors.ink3}
                maxLength={100}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Município</Text>
              <TextInput
                style={styles.input}
                value={municipio}
                onChangeText={setMunicipio}
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
                <Ionicons name="chevron-down" size={16} color={colors.brand} />
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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Telefone <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={telefoneRef}
                style={[styles.input, errors.telefone && styles.inputError]}
                value={telefone}
                onChangeText={(v) => { setTelefone(formatPhone(v)); clearError('telefone'); }}
                onFocus={focusFor(telefoneRef)}
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.ink3}
                maxLength={15}
                keyboardType="phone-pad"
              />
              {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
            </View>

            <Pressable
              style={[styles.submitButton, (loading || loggingOut) && styles.submitButtonDisabled]}
              onPress={handleSalvar}
              disabled={loading || loggingOut}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Concluir cadastro</Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleVoltarLogin}
              disabled={loading || loggingOut}
              style={styles.backButton}
            >
              {loggingOut ? (
                <ActivityIndicator color={colors.brand} size="small" />
              ) : (
                <View style={styles.backRow}>
                  <Ionicons name="chevron-back" size={14} color={colors.brand} />
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
