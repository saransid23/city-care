<div align="center">

# 🏙️ CityCare — CivicPulse

**AI-powered civic issue reporting and tracking platform**

Report neighbourhood problems • Get them resolved faster • Track every step

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [Option A — Python (Flask) Backend](#option-a--python-flask-backend-recommended)
  - [Option B — Node.js (Express) Backend](#option-b--nodejs-express-backend)
  - [One-Click Launch (Windows)](#one-click-launch-windows)
- [Environment Variables](#-environment-variables)
- [Seeding the Database](#-seeding-the-database)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Authentication](#-authentication)
- [AI Priority Classification](#-ai-priority-classification)
- [Pages & Routes](#-pages--routes)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

**CityCare** (codename _CivicPulse_) is a full-stack civic complaint management system that enables citizens to report public infrastructure issues — potholes, water supply disruptions, streetlight failures, garbage accumulation, and electrical hazards — and track their resolution in real time.

The platform uses **keyword-based AI classification** to automatically assign priority levels (Critical / High / Medium / Low) to every complaint, ensuring the most dangerous issues get immediate attention.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Priority Classification** | Automatically detects urgency from complaint descriptions using keyword analysis — critical hazards are flagged instantly |
| 📍 **Location Tracking** | Attach exact locations so field teams can navigate directly to the problem |
| 📸 **Photo Evidence** | Upload images with complaints for faster verification and resolution |
| 🔄 **Real-Time Tracking** | Follow complaints via unique ticket IDs (`CMP-XXXXXXX`) through every stage |
| 📊 **Admin Dashboard** | Live charts (Recharts), filterable tables, and aggregated statistics for authorities |
| 🔐 **Dual Auth System** | Citizen registration/login (JWT) + separate admin login for dashboard access |
| 🌙 **Premium Dark UI** | Glassmorphism, parallax effects, scroll animations, and micro-interactions |
| ⚡ **Dual Backend** | Choose between Flask (Python) or Express (Node.js) — both implement the same API |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI |
| **Vite 5** | Lightning-fast dev server & bundler |
| **React Router 6** | Client-side routing |
| **Recharts** | Dashboard charts and visualisations |
| **Axios** | HTTP client for API communication |
| **Vanilla CSS** | Custom design system with animations |

### Backend (choose one)
| Technology | Purpose |
|---|---|
| **Flask 3 + PyMongo** | Python backend (recommended) |
| **Express 4 + Mongoose** | Node.js backend (original) |

### Database & Auth
| Technology | Purpose |
|---|---|
| **MongoDB** | Document database |
| **JWT (PyJWT / jsonwebtoken)** | Token-based authentication |
| **bcrypt** | Password hashing |
| **Multer / Werkzeug** | File upload handling |

---

## 🏗 Architecture

```
┌─────────────────────────────┐
│         React + Vite        │
│       (localhost:5173)       │
│                             │
│  Home ─ Report ─ Track      │
│  Login ─ Register           │
│  AdminLogin ─ Dashboard     │
└──────────┬──────────────────┘
           │  Axios (REST)
           ▼
┌─────────────────────────────┐
│   Flask / Express API       │
│      (localhost:5000)       │
│                             │
│  /api/auth/*                │
│  /api/complaints/*          │
│  /api/health                │
│  /uploads/*  (static)       │
└──────────┬──────────────────┘
           │  PyMongo / Mongoose
           ▼
┌─────────────────────────────┐
│        MongoDB              │
│    (localhost:27017)        │
│                             │
│  Collections:               │
│  ├── complaints             │
│  └── users                  │
└─────────────────────────────┘
```

---

## 📦 Prerequisites

| Requirement | Version | Install Guide |
|---|---|---|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org) |
| **Python** | 3.9+ | [python.org](https://www.python.org) _(only if using Flask backend)_ |
| **MongoDB** | 6.0+ | [mongodb.com](https://www.mongodb.com/try/download) |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/saransid23/city-care.git
cd city-care
```

### 2. Start MongoDB

Make sure MongoDB is running locally on port `27017`:

```bash
mongod
```

---

### Option A — Python (Flask) Backend _(Recommended)_

```bash
# 1. Create a virtual environment & install dependencies
cd backend_python
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt

# 2. Configure environment
# Edit .env if needed (defaults are already set)

# 3. Start the Flask server
python app.py
```

Backend runs at → **http://localhost:5000**

---

### Option B — Node.js (Express) Backend

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Start with hot-reload
npm run dev

# Or start without hot-reload
npm start
```

Backend runs at → **http://localhost:5000**

---

### 3. Start the Frontend

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

Frontend runs at → **http://localhost:5173**

---

### One-Click Launch (Windows)

Double-click **`run_project.bat`** in the project root. It will:
1. Install frontend dependencies (if `node_modules` is missing)
2. Launch the **frontend** dev server in a new window
3. Launch the **Node.js backend** in a new window

> **Note**: The batch file starts the Express backend. To use the Flask backend instead, start it manually per Option A above.

---

## 🔧 Environment Variables

### Flask Backend (`backend_python/.env`)

| Variable | Default | Description |
|---|---|---|
| `MONGO_URI` | `mongodb://127.0.0.1:27017/city_care` | MongoDB connection string |
| `MONGO_DB` | `city_care` | Database name |
| `PORT` | `5000` | Server port |
| `JWT_SECRET_KEY` | _(set in .env)_ | Secret for signing JWT tokens |
| `JWT_EXPIRATION_SECONDS` | `86400` | Token expiry (24 hours) |

### Express Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `MONGO_URI` | `mongodb://127.0.0.1:27017/civicpulse` | MongoDB connection string |
| `PORT` | `5000` | Server port |

---

## 🌱 Seeding the Database

Populate the database with 30 realistic dummy complaints across all categories:

```bash
cd backend_python
python seed.py
```

Output:
```
✅ Inserted 30 complaints successfully.
📊 Total complaints in DB now: 30
```

The seed script generates complaints across **Pothole**, **Water Supply**, **Streetlight**, **Garbage**, and **Electricity** categories with varied priorities, statuses, and locations spread over the last 30 days.

---

## 📡 API Reference

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — returns `{ status: "ok", time: "..." }` |

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new citizen account |
| `POST` | `/api/auth/login` | Login with email & password |
| `GET` | `/api/auth/me` | Get current user (requires `Bearer` token) |

**Register / Login Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "email": "...", "name": "...", "_id": "..." }
}
```

### Complaints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/complaints` | List all complaints (with filters & pagination) |
| `POST` | `/api/complaints` | Submit a new complaint (supports multipart file upload) |
| `GET` | `/api/complaints/stats` | Aggregated dashboard statistics |
| `GET` | `/api/complaints/:id` | Get a single complaint by ticket ID |
| `PATCH` | `/api/complaints/:id/status` | Update complaint status |

**Query Parameters for `GET /api/complaints`:**

| Param | Example | Description |
|---|---|---|
| `priority` | `Critical` | Filter by priority level |
| `status` | `Pending` | Filter by status |
| `category` | `Pothole` | Filter by category |
| `page` | `1` | Page number (default: 1) |
| `limit` | `50` | Results per page (max: 100) |

**Create Complaint (`POST /api/complaints`):**

Supports both `application/json` and `multipart/form-data` (for photo uploads).

| Field | Required | Description |
|---|---|---|
| `category` | ✅ | One of: `Pothole`, `Water Supply`, `Streetlight`, `Garbage`, `Electricity` |
| `description` | ✅ | Description of the issue (max 300 chars) |
| `location` | ✅ | Location of the issue |
| `photo` | ❌ | Image file attachment |

**Update Status (`PATCH /api/complaints/:id/status`):**
```json
{
  "status": "In Progress"
}
```
Valid statuses: `Pending`, `In Progress`, `Resolved`

### Static Files

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/uploads/:filename` | Serve uploaded complaint photos |

---

## 📁 Project Structure

```
City_Care/
│
├── frontend/                        # React + Vite frontend
│   ├── public/                      # Static assets (logo, favicon)
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.js              # Auth API calls (login, register, getMe)
│   │   │   └── complaints.js        # Complaint API calls (CRUD)
│   │   ├── components/
│   │   │   ├── Footer.jsx           # Site footer with links
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── PageTransition.jsx   # Page transition wrapper
│   │   │   ├── ProtectedRoute.jsx   # Admin route guard
│   │   │   ├── Toast.jsx            # Toast notification system
│   │   │   └── UserProtectedRoute.jsx # Citizen route guard
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Auth state (admin + citizen)
│   │   ├── data/
│   │   │   └── pageContent.js       # Static info page content
│   │   ├── pages/
│   │   │   ├── AdminLogin.jsx       # Admin login page
│   │   │   ├── Dashboard.jsx        # Admin dashboard (charts + table)
│   │   │   ├── Home.jsx             # Landing page with hero & features
│   │   │   ├── InfoPage.jsx         # Dynamic info pages (about, careers…)
│   │   │   ├── Login.jsx            # Citizen login
│   │   │   ├── Register.jsx         # Citizen registration
│   │   │   ├── ReportIssue.jsx      # Complaint submission form
│   │   │   └── Track.jsx            # Complaint tracking by ID
│   │   ├── App.jsx                  # Root component with routing
│   │   ├── index.css                # Global design system & animations
│   │   └── main.jsx                 # Vite entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                         # Node.js / Express backend
│   ├── src/
│   │   ├── middleware/
│   │   │   └── upload.js            # Multer file upload config
│   │   ├── models/
│   │   │   ├── Complaint.js         # Mongoose complaint schema
│   │   │   └── User.js              # Mongoose user schema
│   │   ├── routes/
│   │   │   ├── auth.js              # Auth routes (register, login, me)
│   │   │   └── complaints.js        # Complaint CRUD routes
│   │   └── server.js                # Express entry point
│   ├── uploads/                     # Stored complaint photos
│   ├── .env                         # Environment config
│   └── package.json
│
├── backend_python/                  # Python / Flask backend (alternative)
│   ├── app.py                       # Flask app with all routes
│   ├── seed.py                      # Database seeding script (30 records)
│   ├── requirements.txt             # Python dependencies
│   └── .env                         # Environment config
│
├── uploads/                         # Shared uploads directory
├── run_project.bat                  # Windows one-click launcher
├── mongodb-installer.msi            # MongoDB installer for Windows
├── node-installer.msi               # Node.js installer for Windows
└── README.md                        # ← You are here
```

---

## 🔐 Authentication

CityCare uses a **dual authentication system**:

### Citizen Authentication (JWT)
- Citizens register and log in with **email + password**
- Passwords are hashed using **bcrypt**
- Login returns a **JWT token** stored in `localStorage`
- Protected routes (e.g., `/report`) require an active user session
- Token expiry: **24 hours** (configurable via `JWT_EXPIRATION_SECONDS`)

### Admin Authentication (Session)
- Admin login at `/admin/login` with hardcoded credentials
- Admin session stored in `sessionStorage` (cleared on tab close)
- The `/dashboard` route is protected behind the admin guard

> **Default Admin Credentials:**
> - Username: `admin`
> - Password: `citycare@2024`

---

## 🤖 AI Priority Classification

When a complaint is submitted, the system analyses the **description text** and **category** to automatically assign a priority level:

| Priority | Trigger Keywords | Example |
|---|---|---|
| 🔴 **Critical** | danger, emergency, hazard, accident, fire, flood, electrocution, exposed wire, collapse | _"Exposed electrical wires on the roadside"_ |
| 🟠 **High** | major, severe, broken, days, weeks, no water, no supply, leaking | _"No water supply for the past 3 days"_ |
| 🟡 **Medium** | moderate, overflowing, some, few, minor damage | _"Overflowing garbage bin near market"_ |
| 🟢 **Low** | _(fallback)_ | _"Faded road markings at junction"_ |

**Category-based fallbacks** (when no keywords match):
- Electricity / Water Supply → **High**
- Pothole → **Medium**
- All others → **Low**

---

## 🗺 Pages & Routes

| Route | Page | Access | Description |
|---|---|---|---|
| `/` | Home | Public | Landing page with hero, features, stats, and resolved cases |
| `/login` | Login | Public | Citizen email/password login |
| `/register` | Register | Public | Citizen account registration |
| `/report` | Report Issue | 🔒 Citizen | Submit a new complaint with category, description, location, and photo |
| `/track` | Track | Public | Look up a complaint by its ticket ID (`CMP-XXXXXXX`) |
| `/info/:pageId` | Info Page | Public | Dynamic content pages (about, careers, contact, etc.) |
| `/admin/login` | Admin Login | Public | Admin authentication |
| `/dashboard` | Dashboard | 🔒 Admin | Charts, stats, complaint management table |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "Add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Tips

- Use the **Flask backend** (`backend_python/`) for development — it has hot-reload with `debug=True`
- Run `python seed.py` to populate test data after a fresh database setup
- The frontend proxy is configured to `localhost:5000` in `vite.config.js`
- Both backends serve uploaded files from the `uploads/` directory

---

## 📄 License

This project is for educational and civic improvement purposes.

---

<div align="center">

**Built with ❤️ for better cities**

_Report Today. Improve Tomorrow._

</div>