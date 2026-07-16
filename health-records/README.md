# CareVault

Deployment-ready replacement for the legacy Centralized Patient History System.

## Stack

- Next.js and TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, and Storage
- Vercel deployment

## Local setup

1. Copy `.env.example` to `.env.local` and add the Supabase project values.
2. Run the SQL migration in `supabase/migrations/001_initial_schema.sql` through the Supabase SQL editor or CLI.
3. Run `npm.cmd run dev` and open `http://localhost:3000`.

## Deployment

1. Push the `health-records` directory to a Git repository.
2. Import that repository into Vercel.
3. Add the same variables from `.env.example` in Vercel's Production and Preview environments.
4. Deploy, then confirm `https://your-domain/api/health` returns an `ok` response.

## Safety

The included interface uses generated demo data only. Do not use real patient data until access controls, logging, retention, backups, and the applicable healthcare compliance requirements have been independently reviewed.
