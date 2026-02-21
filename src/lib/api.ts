type Dateityp = 'videos' | 'strecken';

export type FileInfo = {
  name: string;
  typ: Dateityp;
  url: string;
  size: number;
  uploadedAt: string;
};

let pin: string | null = null;

function headers(): HeadersInit {
  if (!pin) throw new Error('Not authenticated');
  return { 'Authorization': `Bearer ${pin}`, 'Content-Type': 'application/json' };
}

async function handleResponse(res: Response): Promise<any> {
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}

export async function login(value: string): Promise<boolean> {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: value }),
  });
  if (res.ok) {
    pin = value;
    return true;
  }
  return false;
}

export function logout(): void {
  pin = null;
}

export function isLoggedIn(): boolean {
  return pin !== null;
}

export async function listFiles(typ: Dateityp): Promise<FileInfo[]> {
  const res = await fetch(`/api/files?typ=${typ}`, { headers: headers() });
  return handleResponse(res);
}

export async function loadFile(typ: Dateityp, name: string): Promise<string> {
  const res = await fetch(`/api/files/${encodeURIComponent(name)}?typ=${typ}`, { headers: headers() });
  const body = await handleResponse(res);
  return body.content;
}

export async function saveFile(typ: Dateityp, name: string, content: string): Promise<void> {
  const res = await fetch(`/api/files/${encodeURIComponent(name)}?typ=${typ}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ content }),
  });
  await handleResponse(res);
}

export async function createFile(typ: Dateityp, name: string, content: string): Promise<void> {
  const res = await fetch(`/api/files?typ=${typ}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name, content }),
  });
  await handleResponse(res);
}

export async function deleteFile(typ: Dateityp, name: string): Promise<void> {
  const res = await fetch(`/api/files/${encodeURIComponent(name)}?typ=${typ}`, {
    method: 'DELETE',
    headers: headers(),
  });
  await handleResponse(res);
}
