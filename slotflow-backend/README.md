# SlotFlow Backend

**SlotFlow** is a booking system MVP for trade-skills training. It features role-based access (Admin & Learner), course management, booking flows, image handling, and JWT-secured authentication.

---

## Tech Stack

- **Python 3.11+**
- **Django 4.x**
- **Django REST Framework**
- **PostgreSQL** (or SQLite for testing)
- **Simple JWT**
- **Pillow** (for image uploads)
- **Custom CLI testing with `curl`**

---

## Setup Instructions

1. **Clone the repository**

At this point you would have already cloned 'slotflow', so just:
```bash
cd slotflow-backend
```

2. **Create virtual environment**

```bash
python -m venv venv
source venv/bin/activate
```

3. **Install dependencies**

```bash
python -m venv venv
source venv/bin/activate
```

4. **Apply migrations**

```bash
python manage.py migrate
```

5. **Run development server**

```bash
python manage.py migrate
```

## Authentication & Roles

- Admins can manage courses (CRUD)

- Learners can browse & book

- JWT Auth with:

- ```/api/auth/register/```

- ```/api/auth/token/```

- ```/api/auth/logout/```

- ```/api/auth/change-password/```

## Test with curl

You can test the full API using simple curl commands:

```bash
bash test_api.sh
```

This script covers:

- Admin & Learner registration

- Login & JWT token flow

- CRUD for courses

- Booking + canceling

- Image uploads (course + profile)

- Email logging (console for MVP)

 ## 📁 Folder Structure
```php
slotflow-backend/
│
├── api/                   # Core app (auth, courses, bookings)
├── media/                 # Uploaded images
├── static/                # Static files (if any)
├── manage.py
├── requirements.txt
├── test_api.sh            # Prebuilt test suite with curl
```

## Email System
- Bookings and cancellations trigger email notifications

- For MVP, emails print to console

✅ MVP Checklist

- Auth & role system (JWT)

- Admin course CRUD

- Learner booking/cancel

- Image uploads

- CLI test coverage




