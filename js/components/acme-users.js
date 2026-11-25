import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from '../services/usersService.js';
import { getCurrentUser } from '../services/auth.js';
import { escapeHtml } from '../utils/sanitize.js';

class AcmeUsers extends HTMLElement {
  constructor() {
    super();
    this.editingUserId = null;
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
    const users = listUsers();
    const editingUser = this.editingUserId ? getUserById(this.editingUserId) : null;
    const currentUser = getCurrentUser();

    if (this.editingUserId && !editingUser) {
      this.editingUserId = null;
    }

    const isEditing = Boolean(editingUser);
    const formValues = this.formDraft ?? editingUser ?? {};

    const feedbackHtml = this.feedback
      ? `<div class="alert alert--${this.feedback.type}" role="alert">${escapeHtml(this.feedback.text)}</div>`
      : '';

    const rowsHtml = users.length
      ? users
          .map((user) => {
            const isSelf = currentUser && currentUser.id === user.id;
            return `
              <tr>
                <td>${escapeHtml(user.identification)}</td>
                <td>
                  ${escapeHtml(user.fullName)}
                  ${isSelf ? '<span class="badge">Tú</span>' : ''}
                </td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.phone)}</td>
                <td><span class="badge">${escapeHtml(user.role)}</span></td>
                <td>
                  <div class="row">
                    <button
                      type="button"
                      class="btn btn--secondary btn--sm"
                      data-action="edit"
                      data-id="${escapeHtml(user.id)}"
                    >
                      Actualizar
                    </button>
                    <button
                      type="button"
                      class="btn btn--danger btn--sm"
                      data-action="delete"
                      data-id="${escapeHtml(user.id)}"
                      ${isSelf ? 'disabled title="No puedes eliminar tu propio usuario"' : ''}
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
          <td colspan="6" class="muted">No hay usuarios registrados.</td>
        </tr>
      `;

    this.innerHTML = `
      <section class="card">
        <div class="row row--between" style="margin-bottom: 0.75rem;">
          <div>
            <h1>Gestión de usuarios</h1>
            <p class="muted">Crea, actualiza o elimina los usuarios con acceso a la plataforma privada.</p>
          </div>
          <span class="badge">Total: ${users.length}</span>
        </div>

        ${feedbackHtml}

        <form class="stack" data-role="user-form" novalidate>
          <h2>${isEditing ? 'Actualizar usuario' : 'Nuevo usuario'}</h2>

          <div class="form-grid">
            <div class="form-group">
              <label for="user-identification">Número de identificación</label>
              <input
                id="user-identification"
                name="identification"
                type="text"
                value="${escapeHtml(formValues.identification ?? '')}"
                placeholder="Ej. 1002345678"
                required
              />
            </div>

            <div class="form-group">
              <label for="user-fullname">Nombre completo</label>
              <input
                id="user-fullname"
                name="fullName"
                type="text"
                value="${escapeHtml(formValues.fullName ?? '')}"
                placeholder="Ej. Laura Gómez"
                required
              />
            </div>

            <div class="form-group">
              <label for="user-email">Email</label>
              <input
                id="user-email"
                name="email"
                type="email"
                value="${escapeHtml(formValues.email ?? '')}"
                placeholder="correo@acme.edu"
                required
              />
            </div>

            <div class="form-group">
              <label for="user-phone">Teléfono</label>
              <input
                id="user-phone"
                name="phone"
                type="tel"
                value="${escapeHtml(formValues.phone ?? '')}"
                placeholder="Ej. 3001234567"
                required
              />
            </div>

            <div class="form-group">
              <label for="user-role">Cargo</label>
              <select id="user-role" name="role" required>
                <option value="">Selecciona un cargo</option>
                <option value="Administrativo" ${formValues.role === 'Administrativo' ? 'selected' : ''}>
                  Administrativo
                </option>
                <option value="Docente" ${formValues.role === 'Docente' ? 'selected' : ''}>
                  Docente
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="user-password">Contraseña</label>
              <input
                id="user-password"
                name="password"
                type="password"
                value="${escapeHtml(formValues.password ?? '')}"
                placeholder="Mínimo 4 caracteres"
                required
              />
            </div>
          </div>

          <div class="row">
            <button type="submit" class="btn btn--primary">
              ${isEditing ? 'Guardar cambios' : 'Crear usuario'}
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
        <h2>Usuarios registrados</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Nombre completo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Cargo</th>
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
    const form = this.querySelector('[data-role="user-form"]');
    form.addEventListener('submit', (event) => this.handleSubmit(event));

    const cancelBtn = this.querySelector('[data-action="cancel"]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.editingUserId = null;
        this.formDraft = null;
        this.feedback = null;
        this.render();
      });
    }

    this.querySelectorAll('[data-action="edit"]').forEach((button) => {
      button.addEventListener('click', () => {
        this.editingUserId = button.dataset.id;
        this.formDraft = null;
        this.feedback = null;
        this.render();
        this.querySelector('#user-identification')?.focus();
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

    const result = this.editingUserId
      ? updateUser(this.editingUserId, payload)
      : createUser(payload);

    if (!result.ok) {
      this.formDraft = payload;
      this.setFeedback('error', result.error);
      this.render();
      return;
    }

    const wasEditing = Boolean(this.editingUserId);
    this.editingUserId = null;
    this.formDraft = null;
    this.setFeedback(
      'success',
      wasEditing
        ? 'Usuario actualizado correctamente.'
        : 'Usuario creado correctamente.'
    );

    this.dispatchEvent(new CustomEvent('users-changed', { bubbles: true }));
    this.render();
  }

  handleDelete(userId) {
    const user = getUserById(userId);
    if (!user) return;

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar al usuario "${user.fullName}"?`
    );
    if (!confirmed) return;

    const result = deleteUser(userId);
    if (!result.ok) {
      this.setFeedback('error', result.error);
      this.render();
      return;
    }

    if (this.editingUserId === userId) {
      this.editingUserId = null;
      this.formDraft = null;
    }

    this.setFeedback('success', 'Usuario eliminado correctamente.');
    this.dispatchEvent(new CustomEvent('users-changed', { bubbles: true }));
    this.render();
  }
}

if (!customElements.get('acme-users')) {
  customElements.define('acme-users', AcmeUsers);
}
