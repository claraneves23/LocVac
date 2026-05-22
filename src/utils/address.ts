export function splitAddress(full: string | undefined | null): { rua: string; numero: string } {
  if (!full) return { rua: '', numero: '' };
  const match = full.match(/^(.*),\s*(\d[^,]*)$/);
  if (match) return { rua: match[1].trim(), numero: match[2].trim() };
  return { rua: full, numero: '' };
}

export function joinAddress(rua: string, numero: string): string {
  const r = rua.trim();
  const n = numero.trim();
  if (r && n) return `${r}, ${n}`;
  return r || n;
}
