import { generateId, getAttempts, saveAttempt } from './storage.js';

export function listAttempts() {
  return getAttempts();
}

export function evaluateAndSaveAttempt({
  exam,
  student,
  selectedAnswers,
  finishedByTimeout = false,
}) {
  const questions = Array.isArray(exam.questions) ? exam.questions : [];
  let correctCount = 0;

  const answers = questions.map((question) => {
    const selectedOptionId = selectedAnswers[question.id] || null;
    const selectedOption =
      question.options.find((opt) => opt.id === selectedOptionId) || null;
    const isCorrect = Boolean(selectedOption && selectedOption.isCorrect);

    if (isCorrect) {
      correctCount += 1;
    }

    return {
      questionId: question.id,
      questionText: question.text,
      selectedOptionId,
      selectedOptionText: selectedOption ? selectedOption.text : null,
      isCorrect,
    };
  });

  const totalQuestions = questions.length;
  const scorePercentage =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 10000) / 100
      : 0;
  const passed = scorePercentage >= Number(exam.passingPercentage);

  const attempt = {
    id: generateId('att'),
    examId: exam.id,
    examCode: exam.code,
    examTitle: exam.title,
    passingPercentage: Number(exam.passingPercentage),
    student: {
      identification: student.identification,
      fullName: student.fullName,
    },
    answers,
    correctCount,
    totalQuestions,
    scorePercentage,
    passed,
    finishedByTimeout: Boolean(finishedByTimeout),
    finishedAt: new Date().toISOString(),
  };

  return saveAttempt(attempt);
}
