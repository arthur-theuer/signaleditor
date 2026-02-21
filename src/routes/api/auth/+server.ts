import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { pin } = await request.json();

  if (!env.EDITOR_PIN) {
    return json({ error: 'Server PIN not configured' }, { status: 500 });
  }

  if (pin !== env.EDITOR_PIN) {
    return json({ error: 'Invalid PIN' }, { status: 401 });
  }

  return json({ ok: true });
};
