export function sanitizeName(value: string): string {
  if (!value) return '';
  return value
    .replace(/[^\p{L}\s'-]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '');
}
