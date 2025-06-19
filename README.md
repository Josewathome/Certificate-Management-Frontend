# Certificate Management Frontend

A modern React + TypeScript frontend for managing certificates, signatories, and graduants, designed to work with a Django REST Framework backend. This app provides a secure, user-friendly interface for creating, editing, and distributing certificates, with robust authentication and role-based access.

---

## Features

- **Certificate Management:** Create, edit, and delete certificates with fields like name, description, CPE hours, logos, and issue/expiry dates.
- **Signatory Management:** Add, edit, and remove signatories for each certificate.
- **Graduant Management:** Add graduants individually or via bulk upload (CSV, Excel, JSON), with search and pagination.
- **Template System:** Apply and preview certificate templates before use.
- **Certificate Generation & Emailing:** Generate certificates and send them to graduants via email.
- **Authentication:** JWT-based authentication with automatic token refresh and secure logout.
- **Responsive Dashboard:** Modern, responsive UI with sidebar navigation.
- **Error Handling:** User-friendly error messages and robust session management.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A running instance of the [Django backend](https://www.djangoproject.com/) (see your backend repo for setup)

### Installation

1. **Clone the repository:**

   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Configure the Backend URL:**

   - Open `src/services/api.ts`.
   - Find the line:
     ```ts
     export const BASE_URL = 'http://127.0.0.1:8000';
     ```
   - Change the URL to match your backend server address if needed (e.g., for production or remote development).

4. **Start the development server:**

   ```sh
   npm run dev
   ```

   The app will be available at [http://localhost:5173](http://localhost:5173) (or as indicated in your terminal).

---

## Project Structure

- `src/pages/` — Main page components (certificate creation, graduant management, etc.)
- `src/components/` — Reusable UI components (forms, layout, etc.)
- `src/services/api.ts` — All API calls and backend URL configuration
- `src/contexts/` — React context providers (authentication, etc.)
- `src/hooks/` — Custom React hooks

---

## Customization

### Setting the Backend URL

To connect the frontend to your Django backend, update the `BASE_URL` in `src/services/api.ts`:

```ts
export const BASE_URL = 'http://127.0.0.1:8000'; // Change this to your backend URL
```

---

## Technologies Used

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (build tool)
- [Tailwind CSS](https://tailwindcss.com/) (utility-first CSS)
- [shadcn/ui](https://ui.shadcn.com/) (UI components)
- [Lucide Icons](https://lucide.dev/) (icon set)
- [Django REST Framework](https://www.django-rest-framework.org/) (backend, not included here)

---

## Deployment

To build for production:

```sh
npm run build
```

Then serve the `dist/` directory with your preferred static file server.

---

## Troubleshooting & Tips

- **CORS/CSRF Issues:**
  - Ensure your backend CORS and CSRF settings allow requests from your frontend domain.
  - For Django, set `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` appropriately.
- **Authentication:**
  - All API endpoints are protected with JWT authentication.
  - If you encounter authentication issues, check your backend and frontend URLs and token settings.
- **Session Expiry:**
  - The frontend will automatically attempt to refresh tokens. If refresh fails, you will be securely logged out and redirected to the login page.
- **Bulk Uploads:**
  - Graduants can be uploaded in bulk via CSV, Excel, or JSON. Ensure your file matches the required format (see the UI for template/download options).
- **Template System:**
  - Certificate templates can be previewed and applied. You can change or edit templates after certificate creation.
- **Extending Functionality:**
  - The codebase is modular and easy to extend. Add new pages to `src/pages/`, new API endpoints to `src/services/api.ts`, and new UI components to `src/components/`.

---

## License

This project is licensed under the MIT License.

---
