# HRMS Lite

A lightweight Human Resource Management System for managing employee records and tracking daily attendance.

![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

---

## Features

- **Employee Management** – Add, view, and delete employees with unique ID and email validation
- **Attendance Tracking** – Mark daily attendance (Present / Absent) per employee
- **Dashboard** – Summary cards (total employees, present today, absent today) with per-employee present-day counts
- **Date Filtering** – Filter attendance records by specific date
- **Responsive UI** – Professional dark-themed interface with glassmorphism design, works on desktop and mobile

---

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend  | Python, FastAPI               |
| Database | PostgreSQL 15                 |
| Server   | Nginx (reverse proxy)         |
| Deploy   | Docker & Docker Compose       |

---

## Project Structure

```
HRMS_full_stack/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   ├── models.py        # Employee & Attendance ORM models
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── employees.py # /api/employees endpoints
│   │       ├── attendance.py# /api/attendance endpoints
│   │       └── dashboard.py # /api/dashboard endpoint
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   ├── js/
│   │   ├── app.js           # Router & utilities
│   │   ├── api.js           # API fetch wrapper
│   │   ├── dashboard.js
│   │   ├── employees.js
│   │   └── attendance.js
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2+)

### Run Locally

```bash
# Clone the repository
git clone <repo-url>
cd HRMS_full_stack

# Start all services
docker compose up --build -d

# Verify containers are running
docker compose ps
```

The application will be available at: **http://localhost:3000**

### Stop

```bash
docker compose down
```

To also remove the database volume:

```bash
docker compose down -v
```

---

## API Endpoints

| Method | Endpoint                      | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | `/api/health`                 | Health check                       |
| POST   | `/api/employees`              | Create a new employee              |
| GET    | `/api/employees`              | List all employees                 |
| GET    | `/api/employees/{id}`         | Get employee by ID                 |
| DELETE | `/api/employees/{id}`         | Delete employee (cascades)         |
| POST   | `/api/attendance`             | Mark attendance                    |
| GET    | `/api/attendance/{emp_id}`    | Get attendance records             |
| GET    | `/api/attendance/{emp_id}?date=YYYY-MM-DD` | Filter by date      |
| GET    | `/api/dashboard`              | Dashboard summary                  |

---

## Assumptions & Limitations

- Single admin user – no authentication required
- Leave management, payroll, and advanced HR features are out of scope
- Department list is pre-defined in the frontend dropdown
- Attendance can only be marked once per employee per day
- Deleting an employee cascades to remove all their attendance records

---

## Deployment Strategy

For production-ready deployment on free tiers (like Render or Railway), follow these steps:

### Option 1: Railway (Recommended - Unified Docker)
Railway is the easiest for this project because it detects the `docker-compose.yml` automatically.
1. Connect your GitHub repo to **Railway**.
2. It will deploy all 3 services (db, backend, frontend).
3. The frontend Nginx will automatically proxy requests to the backend container.

### Option 2: Render (Backend) + Vercel (Frontend)
If you prefer splitting the services:
1. **Backend**: Deploy on **Render** using the `backend/Dockerfile`.
   - Provision a PostgreSQL database and set the `DATABASE_URL` environment variable.
2. **Frontend**: Deploy on **Vercel** or **Netlify**.
   - Before building, you must point the frontend to your live Render backend.
   - Add this script tag to your `index.html` **before** the other scripts:
     ```html
     <script>window.HRMS_CONFIG = { API_URL: 'https://your-backend-url.onrender.com/api' };</script>
     ```

### Handling Backend "Cold Starts"
Most free tiers (Render, Railway, Fly.io) put servers to sleep after inactivity. To ensure a professional experience:
*   We've implemented a **Wait-for-Health** splash screen in [app.js](file:///Users/jatinthakur/HRMS_full_stack/frontend/js/app.js).
*   On first load, the app will show a "Waking up server..." message while pinging the `/api/health` endpoint until the backend wakes up.

---

## Environmental Variables (Backend)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://hrms:hrms@db:5432/hrmsdb` |
| `PORT` | Backend port | `8000` |

---
