import { login as apiLogin, logout as apiLogout, isLoggedIn as apiIsLoggedIn } from './api';

let loggedIn = $state(apiIsLoggedIn());

export function isLoggedIn(): boolean {
  return loggedIn;
}

export async function login(pin: string): Promise<boolean> {
  const ok = await apiLogin(pin);
  if (ok) loggedIn = true;
  return ok;
}

export function logout(): void {
  apiLogout();
  loggedIn = false;
}
