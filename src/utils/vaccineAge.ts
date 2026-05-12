import { VacinaDTO } from '../service/mandatoryVaccineService';

export function getRecommendedAgeMonths(vaccine: VacinaDTO): number {
  return vaccine.idadeMinimaMeses ?? 0;
}

export function getMaxAgeMonths(vaccine: VacinaDTO): number | null {
  return vaccine.idadeMaximaMeses ?? null;
}

export function getAgeInMonths(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const dayDiff = now.getDate() - birth.getDate();
  return years * 12 + months + (dayDiff < 0 ? -1 : 0);
}
