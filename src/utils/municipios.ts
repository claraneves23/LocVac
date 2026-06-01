const cache = new Map<string, string[]>();
const inFlight = new Map<string, Promise<string[]>>();

export async function fetchMunicipios(uf: string): Promise<string[]> {
  const key = uf.toUpperCase();
  const cached = cache.get(key);
  if (cached) return cached;
  const existing = inFlight.get(key);
  if (existing) return existing;
  const promise = (async () => {
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${key}/municipios?orderBy=nome`,
      );
      if (!response.ok) return [];
      const data = (await response.json()) as Array<{ nome: string }>;
      const nomes = data.map((m) => m.nome);
      cache.set(key, nomes);
      return nomes;
    } catch {
      return [];
    } finally {
      inFlight.delete(key);
    }
  })();
  inFlight.set(key, promise);
  return promise;
}

export function formatBirthPlace(city?: string | null, state?: string | null): string {
  const c = (city || '').trim();
  const s = (state || '').trim();
  if (c && s) return `${c} - ${s}`;
  return c || s || '';
}
