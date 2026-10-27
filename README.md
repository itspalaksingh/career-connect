# CareerConnect

CareerConnect is a full-stack job board with a responsive Next.js interface, an Express API, MongoDB-backed jobs and accounts, and cookie-based authentication.

It includes candidate profiles, saved jobs, recruiter access requests, recruiter job management, job applications with status tracking, job reporting, admin moderation, search filters, pagination, and rate-limited authentication endpoints.

## Project layout

- `CareerConnect/frontend` — Next.js app (port 3000)
- `backend` — Express API (port 5000)

## Run locally

1. Create `backend/.env` from `backend/.env.example` and set a real MongoDB Atlas URI plus a long random `JWT_SECRET`. Keep this file private.
2. Start the API from `backend`:

   ```powershell
   npm install
   npm run dev
   ```

3. In a second terminal, start the web app from `CareerConnect/frontend`:

   ```powershell
   npm ci
   npm run dev
   ```

4. Open `http://localhost:3000`. The frontend proxies `/api/*` to `http://localhost:5000` by default. To change the API origin, set `API_BASE_URL` in `CareerConnect/frontend/.env.local`.

## Deploy to Vercel

Deploy the two folders as separate Vercel projects from the same repository/workspace:

### API project

- Project root: `backend`
- Add `MONGODB_URI` and a unique, long `JWT_SECRET` under Vercel Project Settings → Environment Variables for Production (and Preview if needed).
- Add `FRONTEND_URL` after the frontend deployment exists. `CORS_ORIGINS` can contain additional comma-separated origins if needed.
- To enable verification and password-reset email, set `RESEND_API_KEY`, `MAIL_FROM` (a verified sender), and `APP_URL` to the frontend production URL. Until configured, new accounts can sign up without mandatory verification; password reset returns a configuration message.
- Do not set `MONGODB_DNS_SERVERS` in production unless the hosting network explicitly needs a custom resolver.

### Frontend project

- Project root: `CareerConnect/frontend`
- Add `API_BASE_URL` as the deployed API origin, for example `https://your-api.vercel.app` (no trailing slash).
- Optionally set `NEXT_PUBLIC_SITE_URL` to the frontend's canonical origin so the generated `/sitemap.xml` uses your production domain.
- Deploy after setting the variable so the `/api/*` rewrite points to the production API.

The frontend uses same-origin `/api` requests, so login cookies are sent through its API rewrite. Never commit `.env` files or paste production secrets into source control.

## Admin and recruiter access

New accounts start as Candidates. Recruiters request access from their profile; an Admin reviews the request before job-management permissions are granted. Create a normal account, then promote the first administrator from `backend` with:

```powershell
npm run promote-admin -- admin@example.com
```

Admin accounts can review recruiter requests and job reports. Job records can be edited or closed only by their owning Recruiter or an Admin.
