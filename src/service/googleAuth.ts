import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

// Web client ID do Google Cloud Console (mesmo projeto do Firebase).
// É público (vai para o cliente), então pode ficar no código.
const WEB_CLIENT_ID =
  '203043191217-aotpfsc34q18r5otaup4kluac3ahit50.apps.googleusercontent.com';

let configured = false;

export function configureGoogleSignin(): void {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

/** Erro lançado quando o usuário cancela o fluxo de login do Google. */
export class GoogleSignInCancelado extends Error {
  constructor() {
    super('GOOGLE_SIGN_IN_CANCELADO');
    this.name = 'GoogleSignInCancelado';
  }
}

/**
 * Abre o fluxo nativo do Google e retorna o idToken para enviar ao backend.
 * Lança GoogleSignInCancelado se o usuário desistir.
 */
export async function obterIdTokenGoogle(): Promise<string> {
  configureGoogleSignin();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  try {
    const result: any = await GoogleSignin.signIn();

    // v13+ retorna { type: 'success' | 'cancelled', data: { idToken } };
    // versões antigas retornam o userInfo direto, com idToken no topo.
    if (result?.type === 'cancelled') {
      throw new GoogleSignInCancelado();
    }
    const idToken: string | undefined = result?.data?.idToken ?? result?.idToken;
    if (!idToken) {
      throw new Error('Google não retornou um idToken.');
    }
    return idToken;
  } catch (error: any) {
    if (error instanceof GoogleSignInCancelado) throw error;
    if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new GoogleSignInCancelado();
    }
    throw error;
  }
}
