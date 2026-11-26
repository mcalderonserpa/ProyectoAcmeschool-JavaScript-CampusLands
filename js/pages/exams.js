import { initStorage } from '../services/storage.js';
import { requireAuth } from '../services/auth.js';
import '../components/acme-navbar.js';
import '../components/acme-exams.js';

initStorage();

if (requireAuth('./login.html')) {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = '<acme-exams></acme-exams>';
    app.hidden = false;
  }
}
