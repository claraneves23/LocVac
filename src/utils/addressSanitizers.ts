function tidy(value: string): string {
  return value.replace(/\s{2,}/g, ' ').replace(/^\s+/, '');
}

export function sanitizeStreet(value: string): string {
  if (!value) return '';
  return tidy(value.replace(/[^\p{L}\p{N}\s.,'-]/gu, ''));
}

export function sanitizeStreetNumber(value: string): string {
  if (!value) return '';
  return value.replace(/[^0-9A-Za-z/-]/g, '');
}

export function sanitizeComplement(value: string): string {
  if (!value) return '';
  return tidy(value.replace(/[^\p{L}\p{N}\s.,/()\-º°ª]/gu, ''));
}

export function sanitizeNeighborhood(value: string): string {
  if (!value) return '';
  return tidy(value.replace(/[^\p{L}\p{N}\s.'-]/gu, ''));
}

export function sanitizeCity(value: string): string {
  if (!value) return '';
  return tidy(value.replace(/[^\p{L}\s.'-]/gu, ''));
}
