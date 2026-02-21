import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/**
 * Verify the PIN from the Authorization header.
 * Returns null if valid, or a 401 Response if invalid.
 */
export function verifyPin(request: Request): Response | null {
  const header = request.headers.get('Authorization');
  const pin = header?.replace(/^Bearer\s+/i, '');

  if (!env.EDITOR_PIN) {
    return json({ error: 'Server PIN not configured' }, { status: 500 });
  }

  if (!pin || pin !== env.EDITOR_PIN) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
