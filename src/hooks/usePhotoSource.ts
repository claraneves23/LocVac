import { useEffect, useState } from 'react';
import { fetchPessoaFotoDataUrl } from '../service/pessoaFotoService';

const dataUrlCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

const isLocal = (uri: string) =>
  uri.startsWith('data:') ||
  uri.startsWith('file:') ||
  uri.startsWith('content:') ||
  uri.startsWith('http://') ||
  uri.startsWith('https://') ||
  uri.startsWith('blob:');

export function usePhotoSource(photoUri: string | undefined | null): string | undefined {
  const initial = (() => {
    if (!photoUri) return undefined;
    if (isLocal(photoUri)) return photoUri;
    return dataUrlCache.get(photoUri);
  })();
  const [resolved, setResolved] = useState<string | undefined>(initial);

  useEffect(() => {
    if (!photoUri) {
      setResolved(undefined);
      return;
    }
    if (isLocal(photoUri)) {
      setResolved(photoUri);
      return;
    }
    const cached = dataUrlCache.get(photoUri);
    if (cached) {
      setResolved(cached);
      return;
    }

    let cancelled = false;
    let promise = inflight.get(photoUri);
    if (!promise) {
      promise = fetchPessoaFotoDataUrl(photoUri).then((dataUrl) => {
        if (dataUrl) dataUrlCache.set(photoUri, dataUrl);
        inflight.delete(photoUri);
        return dataUrl;
      });
      inflight.set(photoUri, promise);
    }
    promise.then((dataUrl) => {
      if (!cancelled && dataUrl) setResolved(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [photoUri]);

  return resolved;
}

export function invalidatePhotoCache(photoUri?: string | null) {
  if (!photoUri) return;
  dataUrlCache.delete(photoUri);
  inflight.delete(photoUri);
}
