export type RequisitoSenhaKey = 'tamanho' | 'maiuscula' | 'numero' | 'especial';

export type RequisitoSenha = {
  key: RequisitoSenhaKey;
  label: string;
  atendido: boolean;
};

export function verificarRequisitosSenha(senha: string): RequisitoSenha[] {
  return [
    { key: 'tamanho', label: 'No mínimo 8 caracteres', atendido: senha.length >= 8 },
    { key: 'maiuscula', label: 'Ao menos 1 letra maiúscula', atendido: /[A-Z]/.test(senha) },
    { key: 'numero', label: 'Ao menos 1 número', atendido: /\d/.test(senha) },
    { key: 'especial', label: 'Ao menos 1 caractere especial', atendido: /[^A-Za-z0-9]/.test(senha) },
  ];
}

export function senhaAtendeRequisitos(senha: string): boolean {
  return verificarRequisitosSenha(senha).every((r) => r.atendido);
}

export function validarSenha(senha: string): string | null {
  const requisitos = verificarRequisitosSenha(senha);
  const faltando = requisitos.find((r) => !r.atendido);
  if (!faltando) return null;
  switch (faltando.key) {
    case 'tamanho': return 'A senha deve ter no mínimo 8 caracteres.';
    case 'maiuscula': return 'Inclua ao menos 1 letra maiúscula.';
    case 'numero': return 'Inclua ao menos 1 número.';
    case 'especial': return 'Inclua ao menos 1 caractere especial.';
  }
}
