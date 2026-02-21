import { json } from '@sveltejs/kit';
import { list, put, del } from '@vercel/blob';
import { verifyPin } from '$lib/server/auth';
import type { RequestHandler } from './$types';

type Dateityp = 'videos' | 'strecken';

function getPrefix(url: URL): Dateityp | null {
  const typ = url.searchParams.get('typ');
  if (typ === 'videos' || typ === 'strecken') return typ;
  return null;
}

async function findBlob(prefix: string, name: string) {
  const path = `${prefix}/${name}`;
  const { blobs } = await list({ prefix: path });
  return blobs.find((b) => b.pathname === path) ?? null;
}

/** GET /api/files/:name?typ=videos|strecken — read file content */
export const GET: RequestHandler = async ({ request, params, url }) => {
  const denied = verifyPin(request);
  if (denied) return denied;

  const prefix = getPrefix(url);
  if (!prefix) {
    return json({ error: 'Missing or invalid typ parameter (videos|strecken)' }, { status: 400 });
  }

  const blob = await findBlob(prefix, params.name);
  if (!blob) {
    return json({ error: 'File not found' }, { status: 404 });
  }

  const response = await fetch(blob.url);
  const content = await response.text();

  return json({ name: params.name, typ: prefix, content });
};

/** PUT /api/files/:name?typ=videos|strecken — update file content */
export const PUT: RequestHandler = async ({ request, params, url }) => {
  const denied = verifyPin(request);
  if (denied) return denied;

  const prefix = getPrefix(url);
  if (!prefix) {
    return json({ error: 'Missing or invalid typ parameter (videos|strecken)' }, { status: 400 });
  }

  const { content } = await request.json();
  if (typeof content !== 'string') {
    return json({ error: 'Missing file content' }, { status: 400 });
  }

  const existing = await findBlob(prefix, params.name);
  if (existing) {
    await del(existing.url);
  }

  const path = `${prefix}/${params.name}`;
  const blob = await put(path, content, {
    access: 'public',
    contentType: 'text/yaml',
  });

  return json({ name: params.name, typ: prefix, url: blob.url });
};

/** DELETE /api/files/:name?typ=videos|strecken — delete file */
export const DELETE: RequestHandler = async ({ request, params, url }) => {
  const denied = verifyPin(request);
  if (denied) return denied;

  const prefix = getPrefix(url);
  if (!prefix) {
    return json({ error: 'Missing or invalid typ parameter (videos|strecken)' }, { status: 400 });
  }

  const blob = await findBlob(prefix, params.name);
  if (!blob) {
    return json({ error: 'File not found' }, { status: 404 });
  }

  await del(blob.url);

  return json({ ok: true });
};
