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
    description: 'Evaluación general sobre variables, JSON, DOM y almacenamiento en JavaScript.',
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
      {
        id: 'q-4',
        text: '¿Qué método registra un nuevo Web Component personalizado en el navegador?',
        options: [
          { id: 'opt-4-1', text: 'document.createComponent()', isCorrect: false },
          { id: 'opt-4-2', text: 'customElements.define()', isCorrect: true },
          { id: 'opt-4-3', text: 'window.registerElement()', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'exm-js-fast',
    code: 'JS-1MIN',
    title: 'Prueba Rápida de JavaScript (1 min)',
    durationMinutes: 1,
    passingPercentage: 60,
    description: 'Examen corto de 1 minuto para evaluar agilidad en conceptos clave de JS.',
    questions: [
      {
        id: 'qf-1',
        text: '¿Qué operador compara valor y tipo de dato de forma estricta?',
        options: [
          { id: 'optf-1-1', text: '==', isCorrect: false },
          { id: 'optf-1-2', text: '===', isCorrect: true },
          { id: 'optf-1-3', text: '=', isCorrect: false },
        ],
      },
      {
        id: 'qf-2',
        text: '¿Qué método de Array crea un nuevo arreglo con los elementos que cumplen una condición?',
        options: [
          { id: 'optf-2-1', text: 'filter()', isCorrect: true },
          { id: 'optf-2-2', text: 'forEach()', isCorrect: false },
          { id: 'optf-2-3', text: 'push()', isCorrect: false },
        ],
      },
      {
        id: 'qf-3',
        text: '¿Cuál es el tipo de dato que devuelve typeof null en JavaScript?',
        options: [
          { id: 'optf-3-1', text: '"null"', isCorrect: false },
          { id: 'optf-3-2', text: '"undefined"', isCorrect: false },
          { id: 'optf-3-3', text: '"object"', isCorrect: true },
        ],
      },
    ],
  },
  {
    id: 'exm-web-3',
    code: 'WEB-003',
    title: 'Introducción a HTML y Web',
    durationMinutes: 10,
    passingPercentage: 70,
    description: 'Conceptos básicos sobre etiquetas semánticas y estructura de documentos web.',
    questions: [
      {
        id: 'qw-1',
        text: '¿Qué atributo permite cargar un archivo JavaScript usando ES Modules?',
        options: [
          { id: 'optw-1-1', text: 'type="module"', isCorrect: true },
          { id: 'optw-1-2', text: 'mode="esm"', isCorrect: false },
          { id: 'optw-1-3', text: 'script="import"', isCorrect: false },
        ],
      },
      {
        id: 'qw-2',
        text: '¿Qué etiqueta HTML representa el contenido principal único de una página?',
        options: [
          { id: 'optw-2-1', text: '<section>', isCorrect: false },
          { id: 'optw-2-2', text: '<main>', isCorrect: true },
          { id: 'optw-2-3', text: '<div>', isCorrect: false },
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

initStorage();
