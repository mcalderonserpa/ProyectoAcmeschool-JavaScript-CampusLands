import { initStorage } from '../services/storage.js';
import { requireAuth } from '../services/auth.js';
import '../components/acme-navbar.js';
import '../components/acme-exams.js';
import '../components/acme-exam-questions.js';

initStorage();

if (requireAuth('./login.html')) {
  const app = document.getElementById('app');

  const showExamsList = () => {
    app.innerHTML = '<acme-exams></acme-exams>';
  };

  const showExamQuestions = (examId) => {
    app.innerHTML = '';
    const questionsEl = document.createElement('acme-exam-questions');
    questionsEl.setAttribute('exam-id', examId);
    app.appendChild(questionsEl);
  };

  if (app) {
    showExamsList();
    app.hidden = false;

    app.addEventListener('manage-questions', (event) => {
      showExamQuestions(event.detail.examId);
    });

    app.addEventListener('close-questions', () => {
      showExamsList();
    });
  }
}
