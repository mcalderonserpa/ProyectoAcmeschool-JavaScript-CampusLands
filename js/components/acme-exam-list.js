import { getExam, listExams } from '../services/examsService.js';
import { escapeHtml } from '../utils/sanitize.js';

class AcmeExamList extends HTMLElement {
  constructor() {
    super();
    this.selectedExamId = null;
    this.draft = { identification: '', fullName: '' };
    this.error = null;
  }

  connectedCallback() {
    this.render();
  }

  getAvailableExams() {
    return listExams().filter(
      (exam) => Array.isArray(exam.questions) && exam.questions.length > 0
    );
  }

  render() {
    const selectedExam = this.selectedExamId ? getExam(this.selectedExamId) : null;

    if (selectedExam && selectedExam.questions?.length > 0) {
      this.renderStudentForm(selectedExam);
      return;
    }

    this.selectedExamId = null;
    this.renderExamCatalog();
  }

  renderExamCatalog() {
    const exams = this.getAvailableExams();

    const cardsHtml = exams.length
      ? `
        <div class="grid">
          ${exams
            .map(
              (exam) => `
                <article class="card stack" style="margin-bottom: 0; justify-content: space-between;">
                  <div class="stack" style="gap: 0.5rem;">
                    <h2>${escapeHtml(exam.title)}</h2>
                    <p class="muted">${escapeHtml(exam.description)}</p>
                    <div class="row" style="gap: 0.5rem;">
                      <span class="badge">Tiempo: ${escapeHtml(exam.durationMinutes)} min</span>
                      <span class="badge">Aprobación: ${escapeHtml(exam.passingPercentage)}%</span>
                      <span class="badge">${exam.questions.length} preguntas</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn btn--primary"
                    data-action="select-exam"
                    data-id="${escapeHtml(exam.id)}"
                  >
                    Presentar examen
                  </button>
                </article>
              `
            )
            .join('')}
        </div>
      `
      : `
        <section class="card">
          <p class="muted">No hay exámenes disponibles en este momento.</p>
        </section>
      `;

    this.innerHTML = `
      <section class="card">
        <div class="row row--between">
          <div>
            <h1>Exámenes disponibles</h1>
            <p class="muted">Selecciona el examen que deseas presentar. No requiere inicio de sesión.</p>
          </div>
          <span class="badge">Disponibles: ${exams.length}</span>
        </div>
      </section>
      ${cardsHtml}
    `;

    this.querySelectorAll('[data-action="select-exam"]').forEach((button) => {
      button.addEventListener('click', () => {
        this.selectedExamId = button.dataset.id;
        this.error = null;
        this.render();
        this.querySelector('#student-identification')?.focus();
      });
    });
  }

  renderStudentForm(exam) {
    const errorHtml = this.error
      ? `<div class="alert alert--error" role="alert">${escapeHtml(this.error)}</div>`
      : '';

    this.innerHTML = `
      <section class="card container--narrow" style="margin: 0 auto;">
        <div class="row row--between" style="margin-bottom: 0.75rem;">
          <h1>Datos del estudiante</h1>
          <button type="button" class="btn btn--secondary btn--sm" data-action="back">
            ← Cambiar examen
          </button>
        </div>

        <div class="card" style="background: var(--bg); margin-bottom: 1rem;">
          <h2>${escapeHtml(exam.title)}</h2>
          <p class="muted" style="margin-bottom: 0.5rem;">${escapeHtml(exam.description)}</p>
          <div class="row" style="gap: 0.5rem;">
            <span class="badge">Tiempo: ${escapeHtml(exam.durationMinutes)} min</span>
            <span class="badge">Aprobación: ${escapeHtml(exam.passingPercentage)}%</span>
            <span class="badge">${exam.questions.length} preguntas</span>
          </div>
        </div>

        ${errorHtml}

        <form class="stack" data-role="student-form" novalidate>
          <div class="form-group">
            <label for="student-identification">Número de identificación</label>
            <input
              id="student-identification"
              name="identification"
              type="text"
              value="${escapeHtml(this.draft.identification)}"
              placeholder="Ej. 1002345678"
              required
            />
          </div>

          <div class="form-group">
            <label for="student-fullname">Nombre completo</label>
            <input
              id="student-fullname"
              name="fullName"
              type="text"
              value="${escapeHtml(this.draft.fullName)}"
              placeholder="Ej. Carlos Pérez"
              required
            />
          </div>

          <button type="submit" class="btn btn--primary">
            Iniciar examen
          </button>
        </form>
      </section>
    `;

    this.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      this.selectedExamId = null;
      this.error = null;
      this.render();
    });

    this.querySelector('[data-role="student-form"]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const identification = String(formData.get('identification') || '').trim();
      const fullName = String(formData.get('fullName') || '').trim();

      this.draft = { identification, fullName };

      if (!identification) {
        this.error = 'El número de identificación es obligatorio.';
        this.render();
        return;
      }

      if (!fullName) {
        this.error = 'El nombre completo es obligatorio.';
        this.render();
        return;
      }

      this.error = null;
      this.dispatchEvent(
        new CustomEvent('start-exam', {
          bubbles: true,
          detail: {
            exam,
            student: { identification, fullName },
          },
        })
      );
    });
  }
}

if (!customElements.get('acme-exam-list')) {
  customElements.define('acme-exam-list', AcmeExamList);
}
