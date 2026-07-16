# Centralized Patient History System

A secure, case-centric medical record system where patients control access to their data.

## Features
- **Case-Centric Records**: All data (Visits, Labs, Rx) linked to specific medical cases.
- **Granular Consent**: Patients grant/revoke access to providers.
- **Audit Trails**: Every access is logged and visible to the patient.
- **Role-Based Access**: Doctor, Patient, Lab, Pharmacy, Insurance views.

## Tech Stack
- **Frontend**: React + Vite (Simple, clean UI)
- **Backend**: Node.js + Express
- **Database**: SQLite (Local file `server/db/database.sqlite`)

## Setup & Run

### 1. Install Dependencies
(If not already done)
```bash
# Server
cd server
npm install

# Client
cd client
npm install
```

### 2. Initialize Database
```bash
node server/db/initDb.js
```

### 3. Start Backend
```bash
cd server
npm start
```
Runs on Port 3000.

### 4. Start Frontend
```bash
cd client
npm run dev
```
Runs on Port 5173 (usually).

## Demo Credentials
| Role | User ID | Password |
|------|---------|----------|
| **Patient** | `patient-123` | `password` |
| **Doctor** | `doctor-123` | `password` |
| **Lab** | `lab-123` | `password` |
