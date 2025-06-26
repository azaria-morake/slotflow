
# SlotFlow Frontend

**SlotFlow** is the frontend MVP for a training booking platform. Built with **React + Bootstrap**, it integrates with the Django REST backend using **JWT authentication**, offering smooth role-based dashboards for Admins and Learners.

---

##  Tech Stack

- **React 19**
- **Vite**
- **Bootstrap 5**
- **Axios**
- **React Router DOM**
- **JWT Decode**
- **React Hook Form + Yup**
- **React Toastify**

---

##  Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/your-username/slotflow-frontend.git
cd slotflow-frontend
```

2. **Install dependencies**

```bash

cd slotflow-frontend

# Install main dependencies
npm install axios bootstrap react-bootstrap react-router-dom react-toastify react-hook-form jwt-decode @hookform/resolvers yup

# Install dev dependencies
npm install -D sass @types/react @types/react-dom @types/jwt-decode

```
3. **Start development server**

```bash
npm run dev
```
# App Overview

## Entry Flow:
Splash/loading screen with SlotFlow logo

Welcome screen with description and buttons:

Register

Login

 Auth:
Register with role (admin or learner)

Login via username/email

JWT is stored in localStorage

Axios interceptors auto-attach tokens

## Dashboards
 Admin:
View, create, update & delete courses

Upload course images

Monitor bookings

Responsive UI with feedback

 Learner:
View available courses

Book or cancel a course

Upload profile picture

View booking history

## API Integration
The frontend fully integrates with these endpoints:


Register	```/api/auth/register/```

Login	```/api/auth/token/```

Profile Info	```/api/auth/me/```

Upload Pictures	```/api/auth/me/profile-picture/```

Change Password	```/api/auth/change-password/```

Courses CRUD	```/api/courses/```

Book Course	```/api/bookings/```

Cancel Booking	```/api/bookings/:id/cancel/```

Full endpoint and payload documentation lives in the backend README.

 Testing
Run backend locally on ```localhost:8000```

Frontend runs on ```localhost:3000``` by default

Register both roles and explore dashboards

## UI / UX Focus
Clean Bootstrap UI

Responsive mobile-first layout

Toast notifications for all actions

Loading indicators during API calls

## 📁 Folder Structure
```csharp

src/
├── assets/
│   └── logo.svg
├── components/
│   ├── Auth/
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleBasedRoute.jsx
│   ├── Common/
│   │   ├── Button.jsx
│   │   ├── FormInput.jsx
│   │   ├── ImageUpload.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Navbar.jsx
│   │   └── Toast.jsx
│   └── Courses/
│       ├── CourseCard.jsx
│       ├── CourseCardAdmin.jsx
│       └── CourseForm.jsx
├── hooks/
│   ├── useAuth.js
│   └── useApi.js
├── pages/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── Dashboard/
│   │   ├── AdminDashboard.jsx
│   │   └── LearnerDashboard.jsx
│   ├── Course/
│   │   ├── CourseDetail.jsx
│   │   └── BookCourse.jsx
│   ├── Profile.jsx
│   └── Welcome.jsx
├── styles/
│   ├── _variables.scss
│   └── main.scss
├── utils/
│   ├── api.js
│   ├── auth.js
│   └── validators.js
├── App.jsx
└── main.jsx
```


## MVP Checklist
 Auth (register, login, logout)

 JWT handling

 Admin + Learner dashboards

 Form validation (React Hook Form + Yup)

 Bootstrap layout & responsiveness

 Axios integration

 Notifications + loading UX
