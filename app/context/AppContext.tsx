import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPessoaId, fetchPerfil } from '../service/authService';
import { getDependents, getUsuarioTitularIdByPessoaId } from '../service/dependentsService';
import { FamilyMember } from '../types/vaccination';

type AppContextType = {
  mainUser: FamilyMember | null;
  dependents: FamilyMember[];
  usuarioId: string | null;
  isLoading: boolean;
  loadAll: () => Promise<void>;
  refreshDependents: () => Promise<void>;
  reset: () => void;
};

const AppContext = createContext<AppContextType>({
  mainUser: null,
  dependents: [],
  usuarioId: null,
  isLoading: true,
  loadAll: async () => {},
  refreshDependents: async () => {},
  reset: () => {},
});

export function useAppContext() {
  return useContext(AppContext);
}

const mapSexo = (sexo: string): 'M' | 'F' | 'Outro' => {
  if (sexo === 'MASCULINO') return 'M';
  if (sexo === 'FEMININO') return 'F';
  return 'Outro';
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mainUser, setMainUser] = useState<FamilyMember | null>(null);
  const [dependents, setDependents] = useState<FamilyMember[]>([]);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const idPessoa = await getPessoaId();
      if (!idPessoa) {
        setIsLoading(false);
        return;
      }
      const perfil = await fetchPerfil(idPessoa);
      setMainUser({
        id: String(perfil.id),
        userId: String(perfil.id),
        name: perfil.nome,
        birthDate: perfil.dataNascimento,
        sex: mapSexo(perfil.sexoBiologico),
        kind: 'user',
        zipCode: perfil.cep,
        phone: perfil.telefone,
        email: perfil.email,
        photoUri: perfil.fotoUrl || undefined,
      });

      let uid: string | null = perfil.idUsuario || null;
      if (!uid) {
        uid = await getUsuarioTitularIdByPessoaId(perfil.id);
      }
      setUsuarioId(uid);

      if (uid) {
        const deps = await getDependents(uid);
        setDependents(deps);
      }
    } catch (e) {
      console.error('AppContext loadAll error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshDependents = useCallback(async () => {
    if (!usuarioId) return;
    const deps = await getDependents(usuarioId);
    setDependents(deps);
  }, [usuarioId]);

  const reset = useCallback(() => {
    setMainUser(null);
    setDependents([]);
    setUsuarioId(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem('locvac:auth:token');
      if (token) {
        await loadAll();
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  return (
    <AppContext.Provider value={{ mainUser, dependents, usuarioId, isLoading, loadAll, refreshDependents, reset }}>
      {children}
    </AppContext.Provider>
  );
}
