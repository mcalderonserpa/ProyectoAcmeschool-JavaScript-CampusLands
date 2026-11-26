# Escuela Acme — Plataforma de Exámenes Web

Aplicación web desarrollada en **JavaScript modular (ES Modules)** y **Web Components** con persistencia en `localStorage` (formato JSON) para la gestión y resolución de exámenes en línea de la **Escuela Acme**.

---

## Módulos de la aplicación

| Archivo HTML | Acceso | Descripción |
| :--- | :--- | :--- |
| `index.html` | Vista inicial (Login) | Inicio de sesión mediante correo electrónico y contraseña para acceder a los módulos privados. |
| `users.html` | Privado (autenticado) | CRUD completo de usuarios (identificación, nombre completo, email, teléfono, cargo Administrativo/Docente y contraseña). |
| `exams.html` | Privado (autenticado) | CRUD completo de exámenes (código, título, tiempo en minutos, porcentaje de aprobación, descripción) y gestión de preguntas/respuestas con única respuesta correcta. |
| `public-exams.html` | Público (sin login) | Lista exámenes disponibles, solicita identificación y nombre completo del estudiante, ejecuta el examen con reloj regresivo en tiempo real y muestra el resultado final. |

---

## Estructura del proyecto

```text
proyecto_final/
├── index.html                          # Módulo inicial: Login (acceso privado)
├── users.html                          # Módulo privado: gestión de usuarios
├── exams.html                          # Módulo privado: gestión de exámenes
├── public-exams.html                   # Módulo público: resolución de exámenes
├── README.md                           # Documentación del proyecto
├── css/
│   └── styles.css                      # Estilos mínimos, funcionales y responsive
└── js/
    ├── services/
    │   ├── storage.js                  # Persistencia JSON en localStorage y datos semilla
    │   ├── auth.js                     # Login, logout, sesión activa y protección de rutas
    │   ├── usersService.js             # Lógica y validaciones CRUD de usuarios
    │   ├── examsService.js             # Lógica y validaciones CRUD de exámenes y preguntas
    │   └── attemptsService.js          # Evaluación de respuestas y guardado de intentos
    ├── utils/
    │   └── sanitize.js                 # Escape de HTML para renderizado seguro
    ├── components/                     # Web Components (Custom Elements)
    │   ├── acme-navbar.js              # <acme-navbar> Navegación adaptable según sesión
    │   ├── acme-login.js               # <acme-login> Formulario de autenticación
    │   ├── acme-users.js               # <acme-users> Tabla y formulario CRUD de usuarios
    │   ├── acme-exams.js               # <acme-exams> Tabla y formulario CRUD de exámenes
    │   ├── acme-exam-questions.js      # <acme-exam-questions> Gestión de preguntas y opciones
    │   ├── acme-exam-list.js           # <acme-exam-list> Catálogo público y registro del estudiante
    │   └── acme-exam-runner.js         # <acme-exam-runner> Ejecución del examen, reloj y resultado
    └── pages/                          # Controladores por archivo HTML
        ├── login.js                    # Controlador de index.html
        ├── users.js                    # Controlador de users.html
        ├── exams.js                    # Controlador de exams.html
        └── public-exams.js             # Controlador de public-exams.html
```

---

## Estructura de datos en `localStorage`

Los datos se almacenan en formato JSON bajo las siguientes claves (visibles en **DevTools → Application → Local Storage**):

- `acme_users`: arreglo de usuarios registrados (`id`, `identification`, `fullName`, `email`, `phone`, `role`, `password`).
- `acme_exams`: arreglo de exámenes (`id`, `code`, `title`, `durationMinutes`, `passingPercentage`, `description`, `questions`). Cada pregunta contiene `id`, `text` y `options: [{ id, text, isCorrect }]`, garantizando exactamente una opción correcta por pregunta.
- `acme_attempts`: historial de intentos realizados por estudiantes (`id`, `examId`, `examCode`, `examTitle`, `passingPercentage`, `student`, `answers`, `correctCount`, `totalQuestions`, `scorePercentage`, `passed`, `finishedByTimeout`, `finishedAt`).
- `acme_session`: datos de la sesión activa (`id`, `fullName`, `email`, `role`).

---

## Cómo ejecutar el proyecto

1. **VS Code — Live Server**: abre la carpeta del proyecto en VS Code y presiona **Go Live** (o clic derecho sobre `index.html` → **Open with Live Server**).
2. **Python**:
   ```bash
   python -m http.server 5500
   ```
   Luego abre `http://localhost:5500/` en tu navegador.

---

## Datos iniciales de prueba

Al abrir la aplicación con el `localStorage` vacío, `storage.js` precarga automáticamente:

- **Usuario administrador**:
  - **Correo**: `admin@acme.edu`
  - **Contraseña**: `admin123`
- **Exámenes de ejemplo**:
  1. `JS-001` — *Fundamentos de JavaScript* (**5 minutos**, 60% de aprobación, **4 preguntas**, 1 respuesta correcta por pregunta).
  2. `JS-1MIN` — *Prueba Rápida de JavaScript (1 min)* (**1 minuto**, 60% de aprobación, **3 preguntas**, ideal para probar el vencimiento automático del reloj en `00:00`).
  3. `WEB-003` — *Introducción a HTML y Web* (**10 minutos**, 70% de aprobación, **2 preguntas**, útil para probar edición/eliminación sin afectar los otros dos exámenes).

---


