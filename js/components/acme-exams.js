import {
  createExam,
  deleteExam,
  getExam,
  listExams,
  updateExam,
} from '../services/examsService.js';
import { escapeHtml } from '../utils/sanitize.js';

class AcmeExams extends HTMLElement {
  constructor() {
    super();
    this.editingExamId = null;
    this.formDraft = null;
    this.feedback = null;
  }

  connectedCallback() {
    this.render();
  }

  setFeedback(type, text) {
    this.feedback = { type, text };
  }

  render() {
    const exams = listExams();
    const editingExam = this.editingExamId ? getExam(this.editingExamId) : null;

    if (this.editingExamId && !editingExam) {
      this.editingExamId = null;
    }

    const isEditing = Boolean(editingExam);
    const formValues = this.formDraft ?? editingExam ?? {};

    const feedbackHtml = this.feedback
      ? `<div class="alert alert--${this.feedback.type}" role="alert">${escapeHtml(this.feedback.text)}</div>`
      : '';

    const rowsHtml = exams.length
      ? exams
          .map((exam) => {
            const questionCount = Array.isArray(exam.questions) ? exam.questions.length : 0;
            return `
              <tr>
                <td><strong>${escapeHtml(exam.code)}</strong></td>
                <td>
                  <div>${escapeHtml(exam.title)}</div>
                  <div class="muted">${escapeHtml(exam.description)}</div>
                </td>
                <td>${escapeHtml(exam.durationMinutes)} min</td>
                <td>${escapeHtml(exam.passingPercentage)}%</td>
                <td><span class="badge">${questionCount}</span></td>
                <td>
                  <div class="row">
                    <button
                      type="button"
                      class="btn btn--secondary btn--sm"
                      data-action="edit"
                      data-id="${escapeHtml(exam.id)}"
                    >
                      Actualizar
                    </button>
                    <button
                      type="button"
                      class="btn btn--danger btn--sm"
                      data-action="delete"
                      data-id="${escapeHtml(exam.id)}"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            `;
          })
          .join('')
      : `
        <tr>
          <td colspan="6" class="muted">No hay exámenes registrados.</td>
        </tr>
      `;

    this.innerHTML = `
      <section class="card">
        <div class="row row--between" style="margin-bottom: 0.75rem;">
          <div>
            <h1>Gestión de exámenes</h1>
            <p class="muted">Crea, actualiza o elimina los exámenes de la Escuela Acme.</p>
          </div>
          <span class="badge">Total: ${exams.length}</span>
        </div>

        ${feedbackHtml}

        <form class="stack" data-role="exam-form" novalidate>
          <h2>${isEditing ? 'Actualizar examen' : 'Nuevo examen'}</h2>

          <div class="form-grid">
            <div class="form-group">
              <label for="exam-code">Código</label>
              <input
                id="exam-code"
                name="code"
                type="text"
                value="${escapeHtml(formValues.code ?? '')}"
                placeholder="Ej. JS-002"
                required
              />
            </div>

            <div class="form-group">
              <label for="exam-title">Título</label>
              <input
                id="exam-title"
                name="title"
                type="text"
                value="${escapeHtml(formValues.title ?? '')}"
                placeholder="Ej. DOM y Eventos"
                required
              />
            </div>

            <div class="form-group">
              <label for="exam-duration">Tiempo (minutos)</label>
              <input
                id="exam-duration"
                name="durationMinutes"
                type="number"
                min="1"
                step="1"
                value="${escapeHtml(formValues.durationMinutes ?? '')}"
                placeholder="Ej. 15"
                required
              />
            </div>

            <div class="form-group">
              <label for="exam-passing">Porcentaje de aprobación (%)</label>
              <input
                id="exam-passing"
                name="passingPercentage"
                type="number"
                min="1"
                max="100"
                step="1"
                value="${escapeHtml(formValues.passingPercentage ?? '')}"
                placeholder="Ej. 70"
                required
              />
            </div>

            <div class="form-group form-group--full">
              <label for="exam-description">Descripción del examen</label>
              <textarea
                id="exam-description"
                name="description"
                placeholder="Describe brevemente los temas evaluados..."
                required
              >${escapeHtml(formValues.description ?? '')}</textarea>
            </div>
          </div>

          <div class="row">
            <button type="submit" class="btn btn--primary">
              ${isEditing ? 'Guardar cambios' : 'Crear examen'}
            </button>
            ${
              isEditing
                ? '<button type="button" class="btn btn--secondary" data-action="cancel">Cancelar</button>'
                : ''
            }
          </div>
        </form>
      </section>

      <section class="card">
        <h2>Exámenes registrados</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Título y descripción</th>
                <th>Tiempo</th>
                <th>Aprobación</th>
                <th>Preguntas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </section>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const form = this.querySelector('[data-role="exam-form"]');
    form.addEventListener('submit', (event) => this.handleSubmit(event));

    const cancelBtn = this.querySelector('[data-action="cancel"]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.editingExamId = null;
        this.formDraft = null;
        this.feedback = null;
        this.render();
      });
    }

    this.querySelectorAll('[data-action="edit"]').forEach((button) => {
      button.addEventListener('click', () => {
        this.editingExamId = button.dataset.id;
        this.formDraft = null;
        this.feedback = null;
        this.render();
        this.querySelector('#exam-code')?.focus();
      });
    });

    this.querySelectorAll('[data-action="delete"]').forEach((button) => {
      button.addEventListener('click', () => this.handleDelete(button.dataset.id));
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const result = this.editingExamId
      ? updateExam(this.editingExamId, payload)
      : createExam(payload);

    if (!result.ok) {
      this.formDraft = payload;
      this.setFeedback('error', result.error);
      this.render();
      return;
    }

    const wasEditing = Boolean(this.editingExamId);
    this.editingExamId = null;
    this.formDraft = null;
    this.setFeedback(
      'success',
      wasEditing
        ? 'Examen actualizado correctamente.'
        : 'Examen creado correctamente.'
    );
    this.render();
  }

  handleDelete(examId) {
    const exam = getExam(examId);
    if (!exam) return;

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el examen "${exam.title}" (${exam.code}) y todas sus preguntas?`
    );
    if (!confirmed) return;

    const result = deleteExam(examId);
    if (!result.ok) {
      this.setFeedback('error', result.error);
      this.render();
      return;
    }

    if (this.editingExamId === examId) {
      this.editingExamId = null;
      this.formDraft = null;
    }

    this.setFeedback('success', 'Examen eliminado correctamente.');
    this.render();
  }
}

if (!customElements.get('acme-exams')) {
  customElements.define('acme-exams', AcmeExams);
}
