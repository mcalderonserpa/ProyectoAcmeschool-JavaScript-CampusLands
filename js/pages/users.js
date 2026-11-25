import { initStorage } from '../services/storage.js';
import { requireAuth } from '../services/auth.js';
import '../components/acme-navbar.js';
import '../components/acme-users.js';

initStorage();

if (requireAuth('./login.html')) {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = '<acme-users></acme-users>';
    app.hidden = false;

    app.addEventListener('users-changed', () => {
      document.querySelector('acme-navbar')?.render();
    });
  }
}
