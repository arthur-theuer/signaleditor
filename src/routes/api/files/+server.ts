import { json } from '@sveltejs/kit';
import { list, put } from '@vercel/blob';
import { verifyPin } from '$lib/server/auth';
import type { RequestHandler } from './$types';

/** GET /api/files — list all stored YAML files */
export const GET: RequestHandler = async ({ request }) => {
  const denied = verifyPin(request);
  if (denied) return denied;

  const { blobs } = await list({ prefix: 'signals/' });

  const files = blobs.map((b) => ({
    name: b.pathname.replace(/^signals\//, ''),
    url: b.url,
    size: b.size,
    uploadedAt: b.uploadedAt,
  }));

  return json(files);
};

/** POST /api/files — create a new YAML file */
export const POST: RequestHandler = async ({ request }) => {
  const denied = verifyPin(request);
  if (denied) return denied;

  const { name, content } = await request.json();

  if (!name || typeof name !== 'string') {
    return json({ error: 'Missing file name' }, { status: 400 });
  }
  if (typeof content !== 'string') {
    return json({ error: 'Missing file content' }, { status: 400 });
  }

  // Sanitize: only allow alphanumeric, dash, underscore, dot
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `signals/${safeName}`;

  // Check if file already exists
  const { blobs } = await list({ prefix: path });
  const exists = blobs.some((b) => b.pathname === path);
  if (exists) {
    return json({ error: 'File already exists' }, { status: 409 });
  }

  const blob = await put(path, content, {
    access: 'public',
    contentType: 'text/yaml',
  });

  return json({ name: safeName, url: blob.url }, { status: 201 });
};
