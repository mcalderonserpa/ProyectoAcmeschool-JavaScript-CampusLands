import { evaluateAndSaveAttempt } from '../services/attemptsService.js';
import { escapeHtml } from '../utils/sanitize.js';

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

class AcmeExamRunner extends HTMLElement {
  constructor() {
    super();
    this.exam = null;
    this.student = null;
    this.selectedAnswers = {};
    this.timerIntervalId = null;
    this.endTime = null;
    this.isFinished = false;
    this.result = null;
  }

  configure({ exam, student }) {
    this.exam = exam;
    this.student = student;
    this.selectedAnswers = {};
    this.isFinished = false;
    this.result = null;

    if (this.isConnected) {
      this.startExam();
    }
  }

  connectedCallback() {
    if (this.exam && this.student && !this.isFinished && !this.timerIntervalId) {
      this.startExam();
    }
  }

  disconnectedCallback() {
    this.stopTimer();
  }

  stopTimer() {
    if (this.timerIntervalId) {
      window.clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  startExam() {
    this.stopTimer();
    const totalSeconds = Math.max(1, Number(this.exam.durationMinutes)) * 60;
    this.endTime = Date.now() + totalSeconds * 1000;

    this.renderExamView(totalSeconds);
    this.startTimer(totalSeconds);
  }

  startTimer(totalSeconds) {
    const timerEl = this.querySelector('[data-role="timer"]');
    const dangerThreshold = Math.min(30, Math.max(10, Math.floor(totalSeconds * 0.25)));

    const tick = () => {
      if (this.isFinished) {
        this.stopTimer();
        return;
      }

      const remainingMs = this.endTime - Date.now();
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      if (timerEl) {
        timerEl.textContent = formatTime(remainingSeconds);
        timerEl.classList.toggle('timer--danger', remainingSeconds <= dangerThreshold);
      }

      if (remainingMs <= 0) {
        this.finishExam(true);
      }
    };

    tick();
    this.timerIntervalId = window.setInterval(tick, 250);
  }

  renderExamView(initialSeconds) {
    const { exam, student } = this;
    const questions = Array.isArray(exam.questions) ? exam.questions : [];

    const questionsHtml = questions
      .map(
        (question, index) => `
          <fieldset class="card stack" style="gap: 0.65rem; border: 1px solid var(--border);">
            <legend style="font-weight: 600; padding: 0 0.25rem;">
              Pregunta ${index + 1} de ${questions.length}
            </legend>
            <p style="font-weight: 500;">${index + 1}. ${escapeHtml(question.text)}</p>
            <div class="stack" style="gap: 0.45rem;">
              ${question.options
                .map(
                  (option) => `
                    <label class="option-item">
                      <input
                        type="radio"
                        name="question-${escapeHtml(question.id)}"
                        value="${escapeHtml(option.id)}"
                        data-question-id="${escapeHtml(question.id)}"
                      />
                      <span>${escapeHtml(option.text)}</span>
                    </label>
                  `
                )
                .join('')}
            </div>
          </fieldset>
        `
      )
      .join('');

    this.innerHTML = `
      <section
        class="card exam-header"
        aria-label="Encabezado del examen"
      >
        <div class="row row--between exam-header__inner">
          <div>
            <h1>${escapeHtml(exam.title)}</h1>
            <p class="muted">
              Estudiante: <strong>${escapeHtml(student.fullName)}</strong> (${escapeHtml(student.identification)})
            </p>
            <div class="row" style="margin-top: 0.5rem; gap: 0.5rem;">
              <span class="badge">Total de preguntas: ${questions.length}</span>
              <span class="badge">Aprobación: ${escapeHtml(exam.passingPercentage)}%</span>
              <span class="badge" data-role="progress">Respondidas: 0 / ${questions.length}</span>
            </div>
          </div>

          <div class="exam-header__timer">
            <div class="muted" style="font-size: 0.8rem;">Tiempo restante</div>
            <div class="timer" data-role="timer" aria-live="off">
              ${formatTime(initialSeconds)}
            </div>
          </div>
        </div>
      </section>

      <form class="stack" data-role="exam-answers-form">
        ${questionsHtml}

        <div class="card row row--between">
          <span class="muted">Revisa tus respuestas antes de finalizar el examen.</span>
          <button type="submit" class="btn btn--primary">
            Terminar
          </button>
        </div>
      </form>
    `;

    const form = this.querySelector('[data-role="exam-answers-form"]');
    const progressEl = this.querySelector('[data-role="progress"]');

    form.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.type === 'radio') {
        const questionId = target.dataset.questionId;
        if (questionId) {
          this.selectedAnswers[questionId] = target.value;
          const answeredCount = Object.keys(this.selectedAnswers).length;
          if (progressEl) {
            progressEl.textContent = `Respondidas: ${answeredCount} / ${questions.length}`;
          }
        }
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const answeredCount = Object.keys(this.selectedAnswers).length;
      if (answeredCount < questions.length) {
        const unanswered = questions.length - answeredCount;
        const confirmed = window.confirm(
          `Tienes ${unanswered} pregunta(s) sin responder. ¿Deseas terminar el examen de todas formas?`
        );
        if (!confirmed) return;
      }
      this.finishExam(false);
    });
  }

  finishExam(finishedByTimeout) {
    if (this.isFinished) return;

    this.isFinished = true;
    this.stopTimer();

    this.result = evaluateAndSaveAttempt({
      exam: this.exam,
      student: this.student,
      selectedAnswers: this.selectedAnswers,
      finishedByTimeout,
    });

    this.renderResultView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderResultView() {
    const attempt = this.result;
    const statusClass = attempt.passed ? 'alert--success' : 'alert--error';
    const badgeClass = attempt.passed ? 'badge--success' : 'badge--danger';
    const statusTitle = attempt.passed
      ? '¡Examen aprobado!'
      : 'Examen no aprobado';
    const statusDetail = attempt.passed
      ? `Alcanzaste o superaste el porcentaje mínimo requerido (${attempt.passingPercentage}%).`
      : `No alcanzaste el porcentaje mínimo requerido (${attempt.passingPercentage}%).`;

    const timeoutNote = attempt.finishedByTimeout
      ? '<p class="muted" style="margin-bottom: 0.75rem;">El tiempo asignado finalizó y tus respuestas fueron enviadas automáticamente.</p>'
      : '';

    this.innerHTML = `
      <section class="card container--narrow stack" style="margin: 0 auto;">
        <h1>Resultado del examen</h1>
        <p class="muted">
          <strong>${escapeHtml(attempt.examTitle)}</strong> (${escapeHtml(attempt.examCode)})
        </p>

        ${timeoutNote}

        <div class="alert ${statusClass}" role="status">
          <strong>${statusTitle}</strong> — ${escapeHtml(statusDetail)}
        </div>

        <div class="card stack" style="background: var(--bg); margin-bottom: 0; gap: 0.5rem;">
          <div class="row row--between">
            <span class="muted">Estudiante</span>
            <strong>${escapeHtml(attempt.student.fullName)}</strong>
          </div>
          <div class="row row--between">
            <span class="muted">Identificación</span>
            <strong>${escapeHtml(attempt.student.identification)}</strong>
          </div>
          <div class="row row--between">
            <span class="muted">Respuestas acertadas</span>
            <strong>${attempt.correctCount} de ${attempt.totalQuestions}</strong>
          </div>
          <div class="row row--between">
            <span class="muted">Porcentaje obtenido</span>
            <span class="badge ${badgeClass}" style="font-size: 1rem;">
              ${attempt.scorePercentage}%
            </span>
          </div>
          <div class="row row--between">
            <span class="muted">Porcentaje de aprobación</span>
            <strong>${attempt.passingPercentage}%</strong>
          </div>
        </div>

        <button type="button" class="btn btn--primary" data-action="exit">
          Volver a exámenes disponibles
        </button>
      </section>
    `;

    this.querySelector('[data-action="exit"]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('exit-exam', { bubbles: true }));
    });
  }
}

if (!customElements.get('acme-exam-runner')) {
  customElements.define('acme-exam-runner', AcmeExamRunner);
}
