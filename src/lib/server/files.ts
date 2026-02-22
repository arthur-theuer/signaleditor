export type StoragePrefix = 'strecken' | 'routen';

export function getPrefix(url: URL): StoragePrefix | null {
  const typ = url.searchParams.get('typ');
  if (typ === 'strecken' || typ === 'routen') return typ;
  return null;
}
