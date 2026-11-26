import { initStorage } from '../services/storage.js';
import { escapeHtml } from '../utils/sanitize.js';
import '../components/acme-navbar.js';
import '../components/acme-exam-list.js';

initStorage();

const app = document.getElementById('app');

function showExamList() {
  app.innerHTML = '<acme-exam-list></acme-exam-list>';
}

if (app) {
  showExamList();

  app.addEventListener('start-exam', (event) => {
    const { exam, student } = event.detail;
    app.innerHTML = `
      <section class="card">
        <h1>Examen listo para iniciar</h1>
        <p class="muted">
          Estudiante: <strong>${escapeHtml(student.fullName)}</strong> (${escapeHtml(student.identification)}) ·
          Examen: <strong>${escapeHtml(exam.title)}</strong>
        </p>
        <p style="margin-top: 0.75rem;">
          La ejecución del examen y el temporizador se habilitarán en el siguiente commit.
        </p>
        <button type="button" class="btn btn--secondary" data-action="back" style="margin-top: 1rem;">
          ← Volver a la lista
        </button>
      </section>
    `;
    app.querySelector('[data-action="back"]')?.addEventListener('click', showExamList);
  });
}
