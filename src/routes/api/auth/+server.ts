import { json } from '@sveltejs/kit';
import { checkPin } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { pin } = await request.json();
  const error = checkPin(pin);
  if (error) return error;
  return json({ ok: true });
};
