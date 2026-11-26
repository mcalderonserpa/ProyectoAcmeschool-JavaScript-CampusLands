import {
  generateId,
  getExamById,
  getExams,
  saveExams,
} from './storage.js';

function normalizeExamInput(raw) {
  return {
    code: String(raw.code ?? '').trim().toUpperCase(),
    title: String(raw.title ?? '').trim(),
    durationMinutes: Number(raw.durationMinutes),
    passingPercentage: Number(raw.passingPercentage),
    description: String(raw.description ?? '').trim(),
  };
}

function validateExam(data, existingExams, ignoreId = null) {
  if (!data.code) {
    return 'El código del examen es obligatorio.';
  }
  if (!data.title) {
    return 'El título del examen es obligatorio.';
  }
  if (!Number.isInteger(data.durationMinutes) || data.durationMinutes < 1) {
    return 'El tiempo debe ser un número entero mayor o igual a 1 minuto.';
  }
  if (
    !Number.isFinite(data.passingPercentage) ||
    data.passingPercentage < 1 ||
    data.passingPercentage > 100
  ) {
    return 'El porcentaje de aprobación debe estar entre 1 y 100.';
  }
  if (!data.description) {
    return 'La descripción del examen es obligatoria.';
  }

  const duplicateCode = existingExams.some(
    (exam) =>
      exam.id !== ignoreId &&
      exam.code.trim().toUpperCase() === data.code
  );
  if (duplicateCode) {
    return 'Ya existe un examen registrado con ese código.';
  }

  return null;
}

export function listExams() {
  return getExams();
}

export function getExam(examId) {
  return getExamById(examId);
}

export function createExam(rawData) {
  const exams = getExams();
  const data = normalizeExamInput(rawData);
  const error = validateExam(data, exams);

  if (error) {
    return { ok: false, error };
  }

  const newExam = {
    id: generateId('exm'),
    ...data,
    questions: [],
  };

  exams.push(newExam);
  saveExams(exams);

  return { ok: true, exam: newExam };
}

export function updateExam(examId, rawData) {
  const exams = getExams();
  const index = exams.findIndex((exam) => exam.id === examId);

  if (index === -1) {
    return { ok: false, error: 'El examen seleccionado no existe.' };
  }

  const data = normalizeExamInput(rawData);
  const error = validateExam(data, exams, examId);

  if (error) {
    return { ok: false, error };
  }

  const updatedExam = {
    ...exams[index],
    ...data,
  };

  exams[index] = updatedExam;
  saveExams(exams);

  return { ok: true, exam: updatedExam };
}

export function deleteExam(examId) {
  const exams = getExams();
  const remaining = exams.filter((exam) => exam.id !== examId);

  if (remaining.length === exams.length) {
    return { ok: false, error: 'El examen no fue encontrado.' };
  }

  saveExams(remaining);
  return { ok: true };
}
