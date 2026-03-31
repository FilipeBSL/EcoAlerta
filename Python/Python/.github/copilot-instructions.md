# GitHub Copilot / AI Agent Instructions — EcoAlerta

Purpose: quickly orient an AI coding agent to be immediately productive in this repository.

- Big picture
  - This repo centers on the `projeto` workspace: a Node/Express backend and a Vite/React frontend.
  - Backend: `projeto/backend` — Express + Sequelize (Postgres), file storage via MinIO, auth with JWT, email via Nodemailer.
  - Frontend: `projeto/frontend` — Vite + React, uses `VITE_API_URL` to call the backend and `leaflet` for maps.
  - Infrastructure: `projeto/docker-compose.yml` boots services (DB, MinIO, backend, frontend) for local dev.

- Key files to read first
  - Backend bootstrap: [projeto/backend/src/server.js](projeto/backend/src/server.js)
  - App config / middleware: [projeto/backend/src/app.js](projeto/backend/src/app.js)
  - Routes: [projeto/backend/src/routes](projeto/backend/src/routes)
  - Models: [projeto/backend/src/models/index.js](projeto/backend/src/models/index.js)
  - Storage integration: [projeto/backend/src/services/storageService.js](projeto/backend/src/services/storageService.js)
  - Email: [projeto/backend/src/services/emailService.js](projeto/backend/src/services/emailService.js)
  - Frontend entry: [projeto/frontend/src/main.jsx](projeto/frontend/src/main.jsx)
  - Frontend API wrapper: [projeto/frontend/src/services/api.js](projeto/frontend/src/services/api.js)

- How the pieces interact (short)
  - Frontend calls REST endpoints under `/api/v1` (see `VITE_API_URL` in `projeto/.env`).
  - Backend authenticates with JWT (secret set in `projeto/.env`) and stores uploaded photos in MinIO (`MINIO_*` envs).
  - DB schema/migrations live in `projeto/backend/migrations` (initial SQL present).

- Common developer workflows (explicit)
  - Start everything with Docker Compose (recommended for parity): `cd projeto && docker-compose up -d` (uses `projeto/docker-compose.yml`).
  - Run backend alone: `cd projeto/backend && npm install && npm run dev` (uses `nodemon`).
  - Run frontend alone: `cd projeto/frontend && npm install && npm run dev` (Vite dev server).
  - Run backend tests: `cd projeto/backend && npm test` (Jest + Supertest).
  - Before running services locally, copy/validate environment: `projeto/.env` (important keys: `DB_*, JWT_SECRET, MINIO_*, VITE_API_URL`).

- Project-specific conventions and patterns
  - Controller → Service → Model: controllers in `controllers/` call logic in `services/`, which operate on Sequelize models in `models/`.
  - Middlewares are reusable and live in `middlewares/` (auth, authorize, upload, error handling).
  - File uploads: Multer + MinIO via `storageService.js` (do not replace with local disk without updating storage service).
  - Protocol generation and IDs: `utils/generateProtocol.js` is used to produce public protocol strings — keep format consistent when modifying.

- Integration and external dependencies to be careful about
  - MinIO: dev credentials in `.env` are used by `storageService.js`. When testing or running CI, ensure a compatible S3/MinIO endpoint is available.
  - SMTP/Ethereal: `emailService.js` expects SMTP envs; dev `.env` uses Ethereal-like placeholders (check `SMTP_USER`/`SMTP_PASS`).
  - JWT: many routes rely on `JWT_SECRET` and `JWT_EXPIRES_IN` from env.

- When making changes
  - Update corresponding docs under `projeto/docs/` when you change API shapes or architecture.
  - Follow the controller→service boundary: move business logic into `services/` instead of inflating controllers.
  - Run `npm test` in `projeto/backend` before pushing backend changes.

- Where to add notes if the agent cannot infer something
  - Add brief notes to `projeto/README.md` or `projeto/docs/api/api_specification.md`.

If anything here is unclear or you'd like me to include command examples for CI or Windows-specific steps, tell me which area to expand. Ready to apply changes or iterate.
