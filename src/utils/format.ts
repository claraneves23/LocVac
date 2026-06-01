import type { VacinaDTO } from '../service/mandatoryVaccineService';

export function formatDateToBR(isoDate: string | undefined | null): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}

export function formatCpf(value: string | undefined | null): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatCns(value: string | undefined | null): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 15);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 11) return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)} ${digits.slice(11)}`;
}

export function formatCep(value: string | undefined | null): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatRg(value: string | undefined | null): string {
  if (!value) return '';
  const cleaned = value.replace(/[^\dXx]/g, '').toUpperCase().slice(0, 9);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
}

export function formatPhone(value: string | undefined | null): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatSex(sex: string | undefined | null): string {
  if (sex === 'M') return 'Masculino';
  if (sex === 'F') return 'Feminino';
  return 'Outro';
}

export function mapSexo(sexo: string | undefined | null): 'M' | 'F' | 'Outro' {
  if (sexo === 'MASCULINO') return 'M';
  if (sexo === 'FEMININO') return 'F';
  return 'Outro';
}

export function formatAge(months: number): string {
  if (months === 0) return 'Ao nascer';
  if (months === 1) return '1 mês';
  if (months < 12) return `${months} meses`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return y === 1 ? '1 ano' : `${y} anos`;
  return `${y} ano${y > 1 ? 's' : ''} e ${m} mês${m > 1 ? 'es' : ''}`;
}

export function ordinalDose(n: number): string {
  if (n === 1) return '1ª dose';
  if (n === 2) return '2ª dose';
  if (n === 3) return '3ª dose';
  return `${n}ª dose`;
}

export function formatDoseLabel(v: VacinaDTO): string {
  if (!v.tipoDose) return '';
  if (v.tipoDose === 'UNICA') return 'Dose única';
  if (v.tipoDose === 'REFORCO') {
    if (!v.numeroDose || v.numeroDose === 1) return 'Reforço';
    return `${v.numeroDose}º reforço`;
  }
  return v.numeroDose ? ordinalDose(v.numeroDose) : '';
}
