export type StoragePrefix = 'videos' | 'strecken';

export function getPrefix(url: URL): StoragePrefix | null {
  const typ = url.searchParams.get('typ');
  if (typ === 'videos' || typ === 'strecken') return typ;
  return null;
}
