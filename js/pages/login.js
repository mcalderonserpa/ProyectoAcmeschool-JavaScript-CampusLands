import { initStorage } from '../services/storage.js';
import { redirectIfAuthenticated } from '../services/auth.js';
import '../components/acme-navbar.js';
import '../components/acme-login.js';

initStorage();

if (!redirectIfAuthenticated('./users.html')) {
  const loginEl = document.querySelector('acme-login');
  if (loginEl) {
    loginEl.addEventListener('login-success', () => {
      window.location.replace('./users.html');
    });
  }
}
