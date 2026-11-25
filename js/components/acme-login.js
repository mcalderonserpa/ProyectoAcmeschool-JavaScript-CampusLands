import { login } from '../services/auth.js';

class AcmeLogin extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <section class="card">
        <h1>Iniciar sesión</h1>
        <p class="muted" style="margin-bottom: 1rem;">
          Ingresa con tu correo y contraseña para administrar usuarios y exámenes.
        </p>

        <div data-role="alert" role="alert" hidden></div>

        <form class="stack" data-role="login-form" novalidate>
          <div class="form-group">
            <label for="login-email">Correo electrónico</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="admin@acme.edu"
              autocomplete="username"
              required
            />
          </div>

          <div class="form-group">
            <label for="login-password">Contraseña</label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              autocomplete="current-password"
              required
            />
          </div>

          <button type="submit" class="btn btn--primary">Ingresar</button>
        </form>
      </section>
    `;

    const form = this.querySelector('[data-role="login-form"]');
    form.addEventListener('submit', (event) => this.handleSubmit(event));
  }

  showError(message) {
    const alertBox = this.querySelector('[data-role="alert"]');
    alertBox.textContent = message;
    alertBox.className = 'alert alert--error';
    alertBox.hidden = false;
  }

  handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!email || !password) {
      this.showError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    const result = login(email, password);
    if (!result.ok) {
      this.showError(result.error);
      return;
    }

    this.dispatchEvent(
      new CustomEvent('login-success', {
        bubbles: true,
        detail: { user: result.user },
      })
    );
  }
}

if (!customElements.get('acme-login')) {
  customElements.define('acme-login', AcmeLogin);
}
