const STORAGE_KEYS = {
  USERS: 'acme_users',
  EXAMS: 'acme_exams',
  ATTEMPTS: 'acme_attempts',
  SESSION: 'acme_session',
};

const SEED_USERS = [
  {
    id: 'usr-admin-1',
    identification: '1000000001',
    fullName: 'Administrador Acme',
    email: 'admin@acme.edu',
    phone: '3001234567',
    role: 'Administrativo',
    password: 'admin123',
  },
];

const SEED_EXAMS = [
  {
    id: 'exm-js-1',
    code: 'JS-001',
    title: 'Fundamentos de JavaScript',
    durationMinutes: 5,
    passingPercentage: 60,
    description: 'Evaluación básica sobre variables, tipos de datos y funciones en JavaScript.',
    questions: [
      {
        id: 'q-1',
        text: '¿Qué palabra clave se recomienda usar para declarar una variable cuyo valor no será reasignado?',
        options: [
          { id: 'opt-1-1', text: 'const', isCorrect: true },
          { id: 'opt-1-2', text: 'var', isCorrect: false },
          { id: 'opt-1-3', text: 'mutable', isCorrect: false },
        ],
      },
      {
        id: 'q-2',
        text: '¿Qué método convierte un objeto JavaScript a una cadena JSON?',
        options: [
          { id: 'opt-2-1', text: 'JSON.parse()', isCorrect: false },
          { id: 'opt-2-2', text: 'JSON.stringify()', isCorrect: true },
          { id: 'opt-2-3', text: 'JSON.toObject()', isCorrect: false },
        ],
      },
      {
        id: 'q-3',
        text: '¿Qué API del navegador permite guardar datos clave-valor de forma persistente entre sesiones?',
        options: [
          { id: 'opt-3-1', text: 'localStorage', isCorrect: true },
          { id: 'opt-3-2', text: 'historyAPI', isCorrect: false },
          { id: 'opt-3-3', text: 'consoleStorage', isCorrect: false },
        ],
      },
    ],
  },
];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Error leyendo "${key}" desde localStorage:`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    writeJson(STORAGE_KEYS.USERS, SEED_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
    writeJson(STORAGE_KEYS.EXAMS, SEED_EXAMS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
    writeJson(STORAGE_KEYS.ATTEMPTS, []);
  }
}

// Users
export function getUsers() {
  return readJson(STORAGE_KEYS.USERS, []);
}

export function saveUsers(users) {
  writeJson(STORAGE_KEYS.USERS, users);
}

// Exams
export function getExams() {
  return readJson(STORAGE_KEYS.EXAMS, []);
}

export function saveExams(exams) {
  writeJson(STORAGE_KEYS.EXAMS, exams);
}

export function getExamById(examId) {
  return getExams().find((exam) => exam.id === examId) || null;
}

// Attempts
export function getAttempts() {
  return readJson(STORAGE_KEYS.ATTEMPTS, []);
}

export function saveAttempt(attempt) {
  const attempts = getAttempts();
  attempts.push(attempt);
  writeJson(STORAGE_KEYS.ATTEMPTS, attempts);
  return attempt;
}

// Session
export function getSession() {
  return readJson(STORAGE_KEYS.SESSION, null);
}

export function saveSession(sessionUser) {
  writeJson(STORAGE_KEYS.SESSION, sessionUser);
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}
