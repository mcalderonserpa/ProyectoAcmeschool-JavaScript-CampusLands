import {
  addQuestion,
  deleteQuestion,
  getExam,
  updateQuestion,
} from '../services/examsService.js';
import { escapeHtml } from '../utils/sanitize.js';

function createDefaultOptions() {
  return [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
  ];
}

class AcmeExamQuestions extends HTMLElement {
  static get observedAttributes() {
    return ['exam-id'];
  }

  constructor() {
    super();
    this.examId = null;
    this.editingQuestionId = null;
    this.draftText = '';
    this.draftOptions = createDefaultOptions();
    this.feedback = null;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'exam-id' && oldValue !== newValue) {
      this.examId = newValue;
      this.resetFormState();
      this.feedback = null;
      if (this.isConnected) {
        this.render();
      }
    }
  }

  connectedCallback() {
    this.examId = this.getAttribute('exam-id');
    this.render();
  }

  resetFormState() {
    this.editingQuestionId = null;
    this.draftText = '';
    this.draftOptions = createDefaultOptions();
  }

  syncDraftFromDom() {
    const textInput = this.querySelector('#question-text');
    if (textInput) {
      this.draftText = textInput.value;
    }

    const optionRows = this.querySelectorAll('[data-role="option-row"]');
    if (optionRows.length) {
      this.draftOptions = Array.from(optionRows).map((row) => {
        const input = row.querySelector('input[type="text"]');
        const radio = row.querySelector('input[type="radio"]');
        return {
          id: row.dataset.optionId || undefined,
          text: input ? input.value : '',
          isCorrect: Boolean(radio && radio.checked),
        };
      });
    }
  }

  render() {
    const exam = this.examId ? getExam(this.examId) : null;

    if (!exam) {
      this.innerHTML = `
        <section class="card">
          <p class="muted">No se encontró el examen seleccionado.</p>
          <button type="button" class="btn btn--secondary" data-action="back" style="margin-top: 0.75rem;">
            Volver a exámenes
          </button>
        </section>
      `;
      this.querySelector('[data-action="back"]')?.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('close-questions', { bubbles: true }));
      });
      return;
    }

    const questions = Array.isArray(exam.questions) ? exam.questions : [];
    const isEditing = Boolean(this.editingQuestionId);

    const feedbackHtml = this.feedback
      ? `<div class="alert alert--${this.feedback.type}" role="alert">${escapeHtml(this.feedback.text)}</div>`
      : '';

    const optionsFieldsHtml = this.draftOptions
      .map(
        (opt, index) => `
          <div class="row" data-role="option-row" data-option-id="${escapeHtml(opt.id ?? '')}">
            <label class="row" style="gap: 0.35rem; font-weight: 500; white-space: nowrap;">
              <input
                type="radio"
                name="correctOption"
                value="${index}"
                ${opt.isCorrect ? 'checked' : ''}
              />
              Correcta
            </label>
            <input
              type="text"
              data-option-index="${index}"
              value="${escapeHtml(opt.text)}"
              placeholder="Descripción de la respuesta ${index + 1}"
              style="flex: 1; min-width: 180px;"
              required
            />
            <button
              type="button"
              class="btn btn--danger btn--sm"
              data-action="remove-option"
              data-index="${index}"
              ${this.draftOptions.length <= 2 ? 'disabled title="Mínimo 2 respuestas"' : ''}
            >
              Quitar
            </button>
          </div>
        `
      )
      .join('');

    const questionsListHtml = questions.length
      ? questions
          .map(
            (question, index) => `
              <article class="card" style="margin-bottom: 0.75rem;">
                <div class="row row--between" style="margin-bottom: 0.5rem;">
                  <h3>${index + 1}. ${escapeHtml(question.text)}</h3>
                  <div class="row">
                    <button
                      type="button"
                      class="btn btn--secondary btn--sm"
                      data-action="edit-question"
                      data-id="${escapeHtml(question.id)}"
                    >
                      Actualizar
                    </button>
                    <button
                      type="button"
                      class="btn btn--danger btn--sm"
                      data-action="delete-question"
                      data-id="${escapeHtml(question.id)}"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.35rem;">
                  ${question.options
                    .map(
                      (opt) => `
                        <li class="row" style="gap: 0.5rem;">
                          <span>${escapeHtml(opt.text)}</span>
                          ${
                            opt.isCorrect
                              ? '<span class="badge badge--success">Correcta</span>'
                              : ''
                          }
                        </li>
                      `
                    )
                    .join('')}
                </ul>
              </article>
            `
          )
          .join('')
      : '<p class="muted">Este examen aún no tiene preguntas registradas.</p>';

    this.innerHTML = `
      <section class="card">
        <div class="row row--between" style="margin-bottom: 0.75rem;">
          <div>
            <h1>Preguntas: ${escapeHtml(exam.title)}</h1>
            <p class="muted">
              Código: <strong>${escapeHtml(exam.code)}</strong> ·
              Tiempo: ${escapeHtml(exam.durationMinutes)} min ·
              Aprobación: ${escapeHtml(exam.passingPercentage)}%
            </p>
          </div>
          <button type="button" class="btn btn--secondary" data-action="back">
            ← Volver a exámenes
          </button>
        </div>

        ${feedbackHtml}

        <form class="stack" data-role="question-form" novalidate>
          <h2>${isEditing ? 'Actualizar pregunta' : 'Nueva pregunta'}</h2>

          <div class="form-group">
            <label for="question-text">Enunciado de la pregunta</label>
            <textarea
              id="question-text"
              name="text"
              placeholder="Escribe la pregunta..."
              required
            >${escapeHtml(this.draftText)}</textarea>
          </div>

          <div class="stack" style="gap: 0.5rem;">
            <div class="row row--between">
              <label>Respuestas (marca solo una como correcta)</label>
              <button type="button" class="btn btn--secondary btn--sm" data-action="add-option">
                + Agregar respuesta
              </button>
            </div>
            ${optionsFieldsHtml}
          </div>

          <div class="row">
            <button type="submit" class="btn btn--primary">
              ${isEditing ? 'Guardar cambios' : 'Agregar pregunta'}
            </button>
            ${
              isEditing
                ? '<button type="button" class="btn btn--secondary" data-action="cancel-edit">Cancelar</button>'
                : ''
            }
          </div>
        </form>
      </section>

      <section class="card">
        <div class="row row--between" style="margin-bottom: 0.75rem;">
          <h2>Preguntas del examen</h2>
          <span class="badge">Total: ${questions.length}</span>
        </div>
        ${questionsListHtml}
      </section>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('close-questions', { bubbles: true }));
    });

    this.querySelector('[data-action="add-option"]')?.addEventListener('click', () => {
      this.syncDraftFromDom();
      this.draftOptions.push({ text: '', isCorrect: false });
      this.render();
    });

    this.querySelectorAll('[data-action="remove-option"]').forEach((button) => {
      button.addEventListener('click', () => {
        this.syncDraftFromDom();
        if (this.draftOptions.length <= 2) return;

        const index = Number(button.dataset.index);
        const removedWasCorrect = this.draftOptions[index]?.isCorrect;
        this.draftOptions.splice(index, 1);

        if (removedWasCorrect && this.draftOptions.length > 0) {
          this.draftOptions[0].isCorrect = true;
        }
        this.render();
      });
    });

    this.querySelector('[data-role="question-form"]')?.addEventListener('submit', (event) => {
      this.handleSubmit(event);
    });

    this.querySelector('[data-action="cancel-edit"]')?.addEventListener('click', () => {
      this.resetFormState();
      this.feedback = null;
      this.render();
    });

    this.querySelectorAll('[data-action="edit-question"]').forEach((button) => {
      button.addEventListener('click', () => this.startEditQuestion(button.dataset.id));
    });

    this.querySelectorAll('[data-action="delete-question"]').forEach((button) => {
      button.addEventListener('click', () => this.handleDeleteQuestion(button.dataset.id));
    });
  }

  startEditQuestion(questionId) {
    const exam = getExam(this.examId);
    const question = exam?.questions?.find((item) => item.id === questionId);
    if (!question) return;

    this.editingQuestionId = question.id;
    this.draftText = question.text;
    this.draftOptions = question.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      isCorrect: Boolean(opt.isCorrect),
    }));
    this.feedback = null;
    this.render();
    this.querySelector('#question-text')?.focus();
  }

  handleSubmit(event) {
    event.preventDefault();
    this.syncDraftFromDom();

    const payload = {
      text: this.draftText,
      options: this.draftOptions,
    };

    const result = this.editingQuestionId
      ? updateQuestion(this.examId, this.editingQuestionId, payload)
      : addQuestion(this.examId, payload);

    if (!result.ok) {
      this.feedback = { type: 'error', text: result.error };
      this.render();
      return;
    }

    const wasEditing = Boolean(this.editingQuestionId);
    this.resetFormState();
    this.feedback = {
      type: 'success',
      text: wasEditing
        ? 'Pregunta actualizada correctamente.'
        : 'Pregunta agregada correctamente.',
    };

    this.dispatchEvent(new CustomEvent('questions-changed', { bubbles: true }));
    this.render();
  }

  handleDeleteQuestion(questionId) {
    const confirmed = window.confirm('¿Seguro que deseas eliminar esta pregunta?');
    if (!confirmed) return;

    const result = deleteQuestion(this.examId, questionId);
    if (!result.ok) {
      this.feedback = { type: 'error', text: result.error };
      this.render();
      return;
    }

    if (this.editingQuestionId === questionId) {
      this.resetFormState();
    }

    this.feedback = { type: 'success', text: 'Pregunta eliminada correctamente.' };
    this.dispatchEvent(new CustomEvent('questions-changed', { bubbles: true }));
    this.render();
  }
}

if (!customElements.get('acme-exam-questions')) {
  customElements.define('acme-exam-questions', AcmeExamQuestions);
}
