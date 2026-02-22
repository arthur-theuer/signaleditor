import { json } from '@sveltejs/kit';
import { list, put } from '@vercel/blob';
import { verifyPin } from '$lib/server/auth';
import type { RequestHandler } from './$types';

type Dateityp = 'videos' | 'strecken';

function getPrefix(url: URL): Dateityp | null {
  const typ = url.searchParams.get('typ');
  if (typ === 'videos' || typ === 'strecken') return typ;
  return null;
}

/** GET /api/files?typ=videos|strecken — list stored YAML files */
export const GET: RequestHandler = async ({ request, url }) => {
  const denied = verifyPin(request);
  if (denied) return denied;

  const prefix = getPrefix(url);
  if (!prefix) {
    return json({ error: 'Missing or invalid typ parameter (videos|strecken)' }, { status: 400 });
  }

  const { blobs } = await list({ prefix: `${prefix}/` });

  const files = blobs
    .map((b) => ({
      name: b.pathname.replace(new RegExp(`^${prefix}/`), ''),
      typ: prefix,
      url: b.url,
      size: b.size,
      uploadedAt: b.uploadedAt,
    }))
    .filter((f) => f.name.length > 0);

  return json(files);
};

/** POST /api/files?typ=videos|strecken — create a new YAML file */
export const POST: RequestHandler = async ({ request, url }) => {
  const denied = verifyPin(request);
  if (denied) return denied;

  const prefix = getPrefix(url);
  if (!prefix) {
    return json({ error: 'Missing or invalid typ parameter (videos|strecken)' }, { status: 400 });
  }

  const { name, content } = await request.json();

  if (!name || typeof name !== 'string') {
    return json({ error: 'Missing file name' }, { status: 400 });
  }
  if (typeof content !== 'string') {
    return json({ error: 'Missing file content' }, { status: 400 });
  }

  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${prefix}/${safeName}`;

  const { blobs } = await list({ prefix: path });
  const exists = blobs.some((b) => b.pathname === path || b.pathname.startsWith(path));
  if (exists) {
    return json({ error: 'File already exists' }, { status: 409 });
  }

  const blob = await put(path, content, {
    access: 'public',
    contentType: 'text/yaml',
    addRandomSuffix: false,
  });

  return json({ name: safeName, typ: prefix, url: blob.url }, { status: 201 });
};
