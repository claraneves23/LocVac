export const MAX_HUMAN_AGE_YEARS = 120;

export function minBirthDate(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MAX_HUMAN_AGE_YEARS);
  return d;
}

export function isoToDate(iso?: string | null): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime()) ? undefined : d;
}
