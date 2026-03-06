import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/**
 * Check a raw PIN value against the server PIN.
 * Returns null if valid, or an error Response.
 */
export function checkPin(pin: string | null | undefined): Response | null {
  if (!env.EDITOR_PIN) {
    return json({ error: 'Server PIN not configured' }, { status: 500 });
  }
  if (!pin || pin !== env.EDITOR_PIN) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/**
 * Verify the PIN from the Authorization header.
 * Returns null if valid, or an error Response.
 */
export function verifyPin(request: Request): Response | null {
  const header = request.headers.get('Authorization');
  const pin = header?.replace(/^Bearer\s+/i, '');
  return checkPin(pin);
}
