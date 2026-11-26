import { initStorage } from '../services/storage.js';
import '../components/acme-navbar.js';
import '../components/acme-exam-list.js';
import '../components/acme-exam-runner.js';

initStorage();

const app = document.getElementById('app');

function showExamList() {
  app.innerHTML = '<acme-exam-list></acme-exam-list>';
}

function showExamRunner({ exam, student }) {
  app.innerHTML = '';
  const runner = document.createElement('acme-exam-runner');
  runner.configure({ exam, student });
  app.appendChild(runner);
}

if (app) {
  showExamList();

  app.addEventListener('start-exam', (event) => {
    showExamRunner(event.detail);
  });

  app.addEventListener('exit-exam', () => {
    showExamList();
  });
}
