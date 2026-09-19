# 🏥 MedConnect – Doctor Appointment & Digital Health Record System

> A comprehensive full-stack healthcare platform engineered to eliminate paper-based OPD records, prevent appointment scheduling conflicts, and digitize medical prescriptions and patient history.

---

## 🌟 Real-Life Problem & Solution

* **The Problem:** In small-to-medium clinics and regional hospitals, patient appointments and historical records are still maintained in physical registers or scattered paper slips. Patients frequently lose previous prescriptions and diagnostic reports, and doctors lose critical time manually reconstructing medical history.
* **The Solution:** MedConnect provides a centralized, secure digital hub with role-based portals for **Patients**, **Doctors**, and **Administrators**. It automates time-slot management (eliminating double bookings), generates instant teleconsultation rooms, provides printable digital prescriptions, and compiles a lifetime health timeline.

---

## 👥 User Roles & Capabilities

| Role | Key Features |
| :--- | :--- |
| **🧑 Patient** | Register/Login, search doctors by specialty/fees/rating, select real-time available time slots, attend In-Clinic or HD Video consultations (Jitsi Meet), view past medical timeline, print/download PDF prescriptions, and leave doctor reviews. |
| **🩺 Doctor** | Setup practice profile, manage daily queue & schedule, accept/cancel appointments, join 1-click video consultations, issue digital prescriptions with dynamic dosage & advice, and review complete patient history. |
| **👑 Admin** | High-level KPI analytics (Total Patients, Doctors, Appointments, Completed Consultations), approve/suspend doctor accounts, and audit all platform bookings and user records. |

---

## 🛠️ Technology Stack

* **Frontend:** React 19 (Vite), Tailwind CSS v4, Lucide React Icons, React Router DOM v6, Axios.
* **Backend:** Node.js, Express.js REST API, JSON Web Tokens (JWT), Bcrypt.js password hashing.
* **Database:** MongoDB Atlas (Mongoose ODM).
* **Telehealth Integration:** Automated Jitsi Meet encrypted video rooms.

---

## 🔑 Demo Accounts (For Viva, Evaluators & Quick Testing)

You can use the **1-Click Quick Demo Login** buttons on the Login page, or enter the credentials manually:

| Role | Email | Password | What to Test |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@medconnect.com` | `admin123` | System stats, doctor approvals, audit log. |
| **🩺 Doctor (Cardiology)** | `dr.rajesh@medconnect.com` | `doctor123` | Appointment queue, write prescription, view patient history. |
| **🩺 Doctor (General)** | `dr.amit@medconnect.com` | `doctor123` | Consultations, patient queue. |
| **🧑 Patient** | `rahul@gmail.com` | `password123` | Search doctors, book live slot, view Rx timeline & print PDF. |

---

## 🚀 How to Run the Project Locally

### 1. Prerequisites
* Node.js (v18 or higher recommended)
* MongoDB connection string (already configured in `Backend/.env`)

### 2. Backend Setup
```bash
cd Backend

# Install dependencies (if not already done)
npm install

# (Optional) Re-seed fresh demo doctors and sample records
npm run seed

# Run automated test suite to verify all APIs
npm test

# Start the Backend server (runs on http://localhost:5000)
npm start
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd Frontend

# Install dependencies (if not already done)
npm install

# Start the Vite development server
npm run dev
```
Open your browser and visit: **`http://localhost:5173`**

---

## 📡 REST API Endpoints Overview

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register new user (patient or doctor).
* `POST /api/auth/login` — Sign in and receive JWT token.
* `GET /api/auth/me` — Retrieve current authenticated user profile.

### Doctor Directory (`/api/doctors`)
* `GET /api/doctors` — List all verified doctors (supports `specialization`, `search`, `maxFees` filters).
* `GET /api/doctors/:id` — Get specific doctor bio, availability, and clinic details.
* `POST /api/doctors/create-profile` — Create doctor practice profile.
* `GET /api/doctors/profile/me` & `PUT /api/doctors/profile/me` — Manage logged-in doctor profile.

### Appointments (`/api/appointments`)
* `POST /api/appointments/book` — Book appointment with automated slot clash prevention & Jitsi link generation.
* `GET /api/appointments/booked-slots` — Fetch reserved slots for a doctor on a specific date (used to disable slots in UI).
* `GET /api/appointments/my` — Fetch current patient's scheduled & past appointments.
* `GET /api/appointments/doctor` — Fetch current doctor's consultation queue.
* `PATCH /api/appointments/:id/status` — Update visit status (`confirmed`, `completed`, `cancelled`).

### Prescriptions & Health Records (`/api/prescriptions`)
* `POST /api/prescriptions/create` — Doctor issues prescription; marks appointment as `completed`.
* `GET /api/prescriptions/my-prescriptions` — Patient's digital health timeline.
* `GET /api/prescriptions/appointment/:id` — Get prescription for an appointment.
* `GET /api/prescriptions/patient/:id` — Doctor reviews patient's past medical history.

### Reviews & Admin (`/api/reviews`, `/api/admin`)
* `POST /api/reviews` — Patient submits rating & review (updates doctor average rating).
* `GET /api/admin/stats` — High-level platform metrics.
* `GET /api/admin/doctors` — Doctor directory with approval toggles.
* `GET /api/admin/appointments` — System-wide audit log.
