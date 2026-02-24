import type { StoragePrefix } from '../types';

export type { StoragePrefix };

export function getPrefix(url: URL): StoragePrefix | null {
  const typ = url.searchParams.get('typ');
  if (typ === 'strecken' || typ === 'routen') return typ;
  return null;
}
