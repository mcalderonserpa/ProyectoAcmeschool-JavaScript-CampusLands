import {
  generateId,
  getSession,
  getUsers,
  saveSession,
  saveUsers,
} from './storage.js';

const VALID_ROLES = ['Administrativo', 'Docente'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeUserInput(raw) {
  return {
    identification: String(raw.identification ?? '').trim(),
    fullName: String(raw.fullName ?? '').trim(),
    email: String(raw.email ?? '').trim().toLowerCase(),
    phone: String(raw.phone ?? '').trim(),
    role: String(raw.role ?? '').trim(),
    password: String(raw.password ?? ''),
  };
}

function validateUser(data, existingUsers, ignoreId = null) {
  if (!data.identification) {
    return 'El número de identificación es obligatorio.';
  }
  if (!data.fullName) {
    return 'El nombre completo es obligatorio.';
  }
  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    return 'Ingresa un correo electrónico válido.';
  }
  if (!data.phone) {
    return 'El teléfono es obligatorio.';
  }
  if (!VALID_ROLES.includes(data.role)) {
    return 'Selecciona un cargo válido (Administrativo o Docente).';
  }
  if (!data.password || data.password.length < 4) {
    return 'La contraseña es obligatoria y debe tener al menos 4 caracteres.';
  }

  const duplicateIdentification = existingUsers.some(
    (user) =>
      user.id !== ignoreId &&
      user.identification.trim() === data.identification
  );
  if (duplicateIdentification) {
    return 'Ya existe un usuario con ese número de identificación.';
  }

  const duplicateEmail = existingUsers.some(
    (user) =>
      user.id !== ignoreId &&
      user.email.trim().toLowerCase() === data.email
  );
  if (duplicateEmail) {
    return 'Ya existe un usuario registrado con ese correo electrónico.';
  }

  return null;
}

export function listUsers() {
  return getUsers();
}

export function getUserById(userId) {
  return getUsers().find((user) => user.id === userId) || null;
}

export function createUser(rawData) {
  const users = getUsers();
  const data = normalizeUserInput(rawData);
  const error = validateUser(data, users);

  if (error) {
    return { ok: false, error };
  }

  const newUser = {
    id: generateId('usr'),
    ...data,
  };

  users.push(newUser);
  saveUsers(users);

  return { ok: true, user: newUser };
}

export function updateUser(userId, rawData) {
  const users = getUsers();
  const index = users.findIndex((user) => user.id === userId);

  if (index === -1) {
    return { ok: false, error: 'El usuario seleccionado no existe.' };
  }

  const data = normalizeUserInput(rawData);
  const error = validateUser(data, users, userId);

  if (error) {
    return { ok: false, error };
  }

  const updatedUser = {
    ...users[index],
    ...data,
  };

  users[index] = updatedUser;
  saveUsers(users);

  const session = getSession();
  if (session && session.id === updatedUser.id) {
    saveSession({
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  }

  return { ok: true, user: updatedUser };
}

export function deleteUser(userId) {
  const users = getUsers();
  const session = getSession();

  if (session && session.id === userId) {
    return {
      ok: false,
      error: 'No puedes eliminar el usuario con el que tienes la sesión iniciada.',
    };
  }

  const remaining = users.filter((user) => user.id !== userId);
  if (remaining.length === users.length) {
    return { ok: false, error: 'El usuario no fue encontrado.' };
  }

  saveUsers(remaining);
  return { ok: true };
}
