# OneHistory context

## Product

OneHistory is a secure, case-centric health-records platform. Its core principle is patient-controlled consent: providers should access only the records a patient has authorised for the relevant care context.

## Architecture decision

The original prototype used React/Vite, Express, SQLite, local file uploads, and a development JWT secret. That structure is retained in `client/`, `server/`, and `db/` for reference, but it must not be deployed as the production application.

The replacement application lives in `health-records/` and uses:

- Next.js and TypeScript for the web application and server endpoints
- Supabase Auth for identity
- Supabase PostgreSQL with Row Level Security for data
- Supabase Storage for documents
- Vercel for deployment

## Current implementation status

Completed:

- Next.js application scaffold in `health-records/`
- Tailwind dashboard shell using generated demo data
- Health endpoint: `GET /api/health`
- Environment variable template: `health-records/.env.example`
- Initial schema and Row Level Security baseline: `health-records/supabase/migrations/001_initial_schema.sql`
- Production build and lint checks passed locally

Still required:

- Create and connect the Supabase project
- Apply the schema migration
- Implement Supabase Auth and role-aware sign-in
- Replace dashboard demo data with protected database queries
- Add document upload via Supabase Storage
- Add consent-management and audit-log interfaces
- Configure Vercel environment variables and deploy

## Roles

`PATIENT`, `DOCTOR`, `LAB`, `PHARMACY`, and `ADMIN` are defined in the initial database schema. The first release should prioritise patient and doctor flows, then add lab and pharmacy access only when consent rules are fully implemented.

## Security rules

- Do not commit secrets, `.env.local`, or real patient information.
- Use synthetic data for demos and public preview deployments.
- Keep Supabase service-role keys on the server only; they must never be exposed to browser code.
- Every access to a medical case should create an audit event.
- Patient consent must be checked before a provider can retrieve a case or document.

## Deployment check

The deployment is healthy when the Vercel build passes and `https://your-domain/api/health` returns JSON with `"status": "ok"`.
