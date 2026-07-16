# OneHistory

OneHistory is a local, full-stack medical-history application. It has a React/Vite client and an Express/SQLite API server.

## What it does

- Authenticates demo users with JWTs.
- Organizes patient records into cases with clinical visits, lab activity, and prescriptions.
- Lets patients and providers view and manage appointments.
- Enforces consent-based access to patient cases and uploaded documents.
- Supports patient-reported medications and profiles.
- Records API access in an audit log.

## Requirements

- Node.js and npm

## Run locally

Start the API server first. From the repository root:

```powershell
Set-Location server
Copy-Item .env.example .env
# Set JWT_SECRET in .env to a long, unique value before use.
npm install
npm run dev
```

The API listens on `http://localhost:5001`.

Log in with a seeded demo user:

```bash
curl -X POST http://localhost:5001/auth/login -H "Content-Type: application/json" \
  -d '{"id":"patient-123","password":"password"}'
```

This is a demo-only authentication flow: it compares plaintext passwords without hashing and is not representative of production security practice.

In a second terminal, start the client:

```powershell
Set-Location client
npm install
npm run dev
```

Vite serves the client at `http://localhost:5173`. The client is configured to call the API on port `5001`.

## Fresh demo database

The SQLite database is local runtime data and is intentionally not committed. To recreate it with the bundled demo users and an initial case, stop the server and run this from `server`:

```powershell
node .\db\initDb.js
```

This command replaces `server/db/database.sqlite`; do not run it against data you need to keep. The seeded user IDs are `patient-123`, `doctor-123`, `lab-123`, `pharmacy-123`, and `insurance-123`; each uses the demo password `password`.

## Runtime data

SQLite files, local environment files, uploaded documents, build output, logs, and dependencies are excluded from version control. `server/uploads/.gitkeep` preserves the upload directory in a fresh checkout; the server also creates it when a document is uploaded.
