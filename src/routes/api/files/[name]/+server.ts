import { json } from '@sveltejs/kit';
import { list, put, del } from '@vercel/blob';
import { verifyPin } from '$lib/server/auth';
import type { RequestHandler } from './$types';

/** Find the blob matching the given file name under signals/ */
async function findBlob(name: string) {
  const path = `signals/${name}`;
  const { blobs } = await list({ prefix: path });
  return blobs.find((b) => b.pathname === path) ?? null;
}

/** GET /api/files/:name — read file content */
export const GET: RequestHandler = async ({ request, params }) => {
  const denied = verifyPin(request);
  if (denied) return denied;

  const blob = await findBlob(params.name);
  if (!blob) {
    return json({ error: 'File not found' }, { status: 404 });
  }

  const response = await fetch(blob.url);
  const content = await response.text();

  return json({ name: params.name, content });
};

/** PUT /api/files/:name — update file content */
export const PUT: RequestHandler = async ({ request, params }) => {
  const denied = verifyPin(request);
  if (denied) return denied;

  const { content } = await request.json();
  if (typeof content !== 'string') {
    return json({ error: 'Missing file content' }, { status: 400 });
  }

  // Delete old blob if it exists (Vercel Blob is immutable, so overwrite = delete + put)
  const existing = await findBlob(params.name);
  if (existing) {
    await del(existing.url);
  }

  const path = `signals/${params.name}`;
  const blob = await put(path, content, {
    access: 'public',
    contentType: 'text/yaml',
  });

  return json({ name: params.name, url: blob.url });
};

/** DELETE /api/files/:name — delete file */
export const DELETE: RequestHandler = async ({ request, params }) => {
  const denied = verifyPin(request);
  if (denied) return denied;

  const blob = await findBlob(params.name);
  if (!blob) {
    return json({ error: 'File not found' }, { status: 404 });
  }

  await del(blob.url);

  return json({ ok: true });
};
