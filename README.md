
# SlotFlow MVP – Consolidated Technical Briefing

> **SlotFlow** is a booking platform MVP focused on vocational skills training. It supports **Admin** and **Learner** roles, where Admins create and manage courses, and Learners can book them. This briefing consolidates architecture, workflows, endpoints, and integration details across the full-stack solution.

---

## Stack Overview

| Layer          | Tech Stack                                                             |
| -------------- | ---------------------------------------------------------------------- |
| **Frontend**   | React 19, Vite, React Router, Bootstrap 5, Axios, React Hook Form, Yup |
| **Backend**    | Django 4.x, Django REST Framework, Simple JWT, PostgreSQL or SQLite    |
| **Auth**       | Role-based JWT (Access + Refresh)                                      |
| **Storage**    | Local media storage for profile/course images (via `MEDIA_URL`)        |
| **Deployment** | Ready for local/dev Docker or basic VPS/manual deployment              |

---

##  User Roles & Permissions

### 1. **Admin**

* Register/Login
* Create/update/delete courses
* Upload course images
* View bookings

### 2. **Learner**

* Register/Login
* View and book courses
* Cancel bookings
* Upload profile image
* View booking history

---

## Backend Overview

### Key Endpoints (Testable via `curl` or Postman)

#### Auth

| Action           | Method     | Endpoint                        |
| ---------------- | ---------- | ------------------------------- |
| Register         | POST       | `/api/auth/register/`           |
| Login (JWT)      | POST       | `/api/auth/token/`              |
| Logout (Refresh) | POST       | `/api/auth/logout/`             |
| Profile Info     | GET        | `/api/auth/me/`                 |
| Change Password  | POST       | `/api/auth/change-password/`    |
| Profile Picture  | PUT/DELETE | `/api/auth/me/profile-picture/` |

#### Courses

| Action             | Method     | Endpoint                           |
| ------------------ | ---------- | ---------------------------------- |
| List Courses       | GET        | `/api/courses/`                    |
| View Single Course | GET        | `/api/courses/:id/`                |
| Create Course      | POST       | `/api/courses/` (admin only)       |
| Update Course      | PATCH      | `/api/courses/:id/`                |
| Course Picture     | PUT/DELETE | `/api/courses/:id/course-picture/` |
| Soft Delete Course | DELETE     | `/api/courses/:id/`                |

#### Bookings

| Action         | Method | Endpoint                    |
| -------------- | ------ | --------------------------- |
| Book Course    | POST   | `/api/bookings/`            |
| View Bookings  | GET    | `/api/bookings/`            |
| Cancel Booking | PATCH  | `/api/bookings/:id/cancel/` |

### Key Backend Features

* **Role separation** with custom user model
* **Email simulation** via console logs
* **Media upload support** (`/media/`)
* **JWT secured routes**
* Full **API doc and `curl` test suite**

---

## 🎨 Frontend Overview

### Main Screens

| Screen            | Description                                         |
| ----------------- | --------------------------------------------------- |
| Landing Page      | App intro with CTA buttons for login or register    |
| Auth Screens      | Separate forms for Admin and Learner sign-up/login  |
| Admin Dashboard   | View/create/edit courses, view bookings             |
| Learner Dashboard | View/book/cancel courses, upload profile image      |
| Notifications     | All actions are toastified and show visual feedback |

### Integration Strategy

* **JWT Handling**: Access token stored in `localStorage`
* **Axios Interceptors** auto-attach tokens to every API call
* **Bootstrap UI** for layout and forms
* **Yup** validation in all forms (register, login, course create, etc.)
* **React Hook Form** for smooth form handling and submission

---

## Example CLI Test (Register Admin)

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin1", "email": "admin@slotflow.com", "password": "Admin@1234", "password2": "Admin@1234", "role": "admin"}'
```


---

## Workflow Summary

1. **User registers** with role (`admin` or `learner`)
2. Logs in and gets **access + refresh tokens**
3. **Admin** creates courses (optionally uploading a cover image)
4. **Learner** browses courses and makes a booking
5. Learner can **cancel**, and both actions trigger email simulation
6. Admin and learner can **upload profile pictures**

---

## MVP Goals Achieved

| Feature                          | Status |
| -------------------------------- | ------ |
| Role-based Auth (JWT)            | ✅      |
| Admin Course Management          | ✅      |
| Learner Bookings                 | ✅      |
| Course & Profile Picture Uploads | ✅      |
| Bootstrap UI (MVP friendly)      | ✅      |
| Full API Test Coverage (curl)    | ✅      |
| Form Validation                  | ✅      |
| Responsive Frontend              | ✅      |

---

## File Structure (Simplified)

### Backend

```
slotflow-backend/
├── api/              # Core Django app
├── media/            # Uploaded images
├── test_api.sh       # curl test script
├── manage.py
```

### Frontend

```
slotflow-frontend/
├── src/
│   ├── pages/        # Register, Login, Dashboards
│   ├── components/   # Header, Footer, Cards
│   └── auth/         # Context, token management
├── public/
├── vite.config.js
├── package.json
```

---

## Auth Token Flow

* **Access Token** expires in minutes
* **Refresh Token** can renew access
* Stored in localStorage for simplicity
* Interceptors ensure seamless requests

---

## Final Notes

* You can demo this MVP locally with **no Tailwind**.
* Bootstrap handles styling and layout.
* API design is modular and easy to expand.
* No dependency conflicts. Just run `npm install` and go.

