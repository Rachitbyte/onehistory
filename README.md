# OneHistory

OneHistory is a consent-aware clinical-records platform. Patients retain control over access to their case-based records, while authorised healthcare providers can review the information required for care.

## Current application

The deployment target is [`health-records`](./health-records), a Next.js and TypeScript application prepared for Vercel and Supabase.

| Area | Technology |
| --- | --- |
| Web application | Next.js, TypeScript, Tailwind CSS |
| Authentication and data | Supabase Auth and PostgreSQL |
| File storage | Supabase Storage |
| Hosting | Vercel |

The application currently provides a validated dashboard shell, a production health endpoint at `/api/health`, an environment template, and an initial Supabase migration for users, medical cases, consents, and audit events.

## Run locally

```powershell
cd health-records
Copy-Item .env.example .env.local
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`.

Before connecting real data, add the Supabase values to `.env.local` and run the migration at `health-records/supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor or through the Supabase CLI.

## Deploy

1. Push the `health-records` directory to the `onehistory` GitHub repository.
2. Import the repository into Vercel, setting `health-records` as the root directory if the repository includes this workspace structure.
3. Add the variables from `.env.example` to the Preview and Production environments.
4. Deploy and verify `https://your-domain/api/health` returns an `ok` response.

## Legacy application

The `client`, `server`, and `db` folders contain the original React/Vite, Express, and SQLite prototype. They are retained as a reference only and are not the deployment target. See [`context.md`](./context.md) for architecture decisions and the current roadmap.

## Data safety

Use synthetic demo data only until authentication, authorisation, audit logging, backups, retention, and applicable healthcare compliance requirements have been independently reviewed. Never commit `.env.local`, credentials, or real patient data.
