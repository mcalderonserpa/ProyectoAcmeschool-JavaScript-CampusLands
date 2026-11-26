import {
  clearSession,
  getSession,
  getUsers,
  saveSession,
} from './storage.js';

export function getCurrentUser() {
  const session = getSession();
  if (!session) return null;

  const existingUser = getUsers().find((user) => user.id === session.id);
  if (!existingUser) {
    clearSession();
    return null;
  }

  return {
    id: existingUser.id,
    fullName: existingUser.fullName,
    email: existingUser.email,
    role: existingUser.role,
  };
}

export function isAuthenticated() {
  return Boolean(getCurrentUser());
}

export function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = getUsers().find(
    (item) =>
      item.email.trim().toLowerCase() === normalizedEmail &&
      item.password === password
  );

  if (!user) {
    return {
      ok: false,
      error: 'Correo o contraseña incorrectos.',
    };
  }

  const sessionUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };

  saveSession(sessionUser);
  return { ok: true, user: sessionUser };
}

export function logout(redirectTo = './index.html') {
  clearSession();
  window.location.replace(redirectTo);
}

export function requireAuth(redirectTo = './index.html') {
  if (!isAuthenticated()) {
    window.location.replace(redirectTo);
    return false;
  }
  return true;
}

export function redirectIfAuthenticated(redirectTo = './users.html') {
  if (isAuthenticated()) {
    window.location.replace(redirectTo);
    return true;
  }
  return false;
}
