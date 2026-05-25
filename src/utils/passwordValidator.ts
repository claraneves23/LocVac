export function validarSenha(senha: string): string | null {
  if (senha.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
  if (!/[A-Z]/.test(senha)) return 'Inclua ao menos 1 letra maiúscula.';
  if (!/\d/.test(senha)) return 'Inclua ao menos 1 número.';
  if (!/[^A-Za-z0-9]/.test(senha)) return 'Inclua ao menos 1 caractere especial.';
  return null;
}
