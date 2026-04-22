import { VacinaDTO } from '../service/mandatoryVaccineService';

/**
 * Idade mínima (em meses) em que a vacina pode/deve ser aplicada,
 * vinda do back. Para vacinas obrigatórias, representa a idade
 * a partir da qual a dose deve aparecer como pendente.
 */
export function getRecommendedAgeMonths(vaccine: VacinaDTO): number {
  return vaccine.idadeMinimaMeses ?? 0;
}

/**
 * Idade máxima (em meses) em que a vacina ainda está dentro da faixa.
 * Retorna null se não houver limite máximo (caso das obrigatórias).
 */
export function getMaxAgeMonths(vaccine: VacinaDTO): number | null {
  return vaccine.idadeMaximaMeses ?? null;
}

/** Retorna a idade de uma pessoa em meses completos a partir de sua data de nascimento (ISO). */
export function getAgeInMonths(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const dayDiff = now.getDate() - birth.getDate();
  return years * 12 + months + (dayDiff < 0 ? -1 : 0);
}
