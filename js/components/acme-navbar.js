import { getCurrentUser, logout } from '../services/auth.js';
import { escapeHtml } from '../utils/sanitize.js';

class AcmeNavbar extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  isCurrentPage(fileName) {
    const path = window.location.pathname;
    if (fileName === 'index.html' && (path.endsWith('/') || path.endsWith('/index.html'))) {
      return true;
    }
    return path.endsWith(`/${fileName}`);
  }

  render() {
    const user = getCurrentUser();

    const privateLinks = user
      ? `
        <a href="./users.html" class="navbar__link ${this.isCurrentPage('users.html') ? 'navbar__link--active' : ''}">
          Usuarios
        </a>
        <a href="./exams.html" class="navbar__link ${this.isCurrentPage('exams.html') ? 'navbar__link--active' : ''}">
          Gestión de Exámenes
        </a>
        <span class="badge" title="${escapeHtml(user.email)}">${escapeHtml(user.fullName)} (${escapeHtml(user.role)})</span>
        <button type="button" class="btn btn--secondary btn--sm" data-action="logout">
          Cerrar sesión
        </button>
      `
      : `
        <a href="./login.html" class="navbar__link ${this.isCurrentPage('login.html') ? 'navbar__link--active' : ''}">
          Iniciar sesión
        </a>
      `;

    this.innerHTML = `
      <header class="navbar">
        <nav class="navbar__inner" aria-label="Navegación principal">
          <a href="./index.html" class="navbar__brand">Escuela Acme</a>
          <div class="navbar__links">
            <a href="./index.html" class="navbar__link ${this.isCurrentPage('index.html') ? 'navbar__link--active' : ''}">
              Resolver Exámenes
            </a>
            ${privateLinks}
          </div>
        </nav>
      </header>
    `;

    const logoutBtn = this.querySelector('[data-action="logout"]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => logout('./login.html'));
    }
  }
}

if (!customElements.get('acme-navbar')) {
  customElements.define('acme-navbar', AcmeNavbar);
}
