## Changelog
- **2025-10-07**: **COLOR THEME UPDATED** - Replaced the default color palette with a professional one based on the provided design example. The new theme uses `oklch` color values for better consistency and adopts the full range of semantic colors from the reference.
- **2025-10-07**: **DESIGN OVERHAUL COMPLETE** - Implemented a professional dashboard layout using a new `DashboardLayout` component with a persistent sidebar and a main content grid. The design now closely matches the reference image, providing a much-improved user experience.
- **2025-10-07**: **LOGIN ROUTE GUARD ADDED** - Fixed issue where navigating to `/login` while authenticated would logout user. Added `beforeLoad` guard to login route that redirects authenticated users to dashboard, preventing unnecessary logout. This implements proper UX pattern where authenticated users can't access login page.
- **2025-10-07**: **AUTO-LOGOUT ISSUE RESOLVED** - Fixed API response structure mismatch causing immediate logout after login. Backend returns `{ data: { token, user }, success: true }` but frontend was expecting `{ token, user }` directly. Updated login function to properly destructure nested response. Added console logging for debugging and improved router auth timing with small delay to ensure token storage.
- **2025-10-07**: **BLANK SCREEN ISSUE RESOLVED** - Fixed router configuration causing blank dashboard after login. Simplified TanStack Router setup by removing complex ProtectedLayout wrapper and integrating header/logout directly into dashboard component. Fixed missing `use-mobile` hook import and removed problematic `tw-animate-css` import. Dashboard now renders correctly with shadcn dashboard-01 components fully integrated.
- **2025-10-07**: Documented Tailwind CSS v4 production build fix (replace `@apply` utilities with direct CSS) and clarified testing workflow (native `pnpm build` succeeds before Docker multi-stage build). Added note about reserving host ports (8080 in use by other services) and using alternate port mapping (e.g., 8081) when running the prod container.
- **2025-10-07**: Expanded Environment & Docker section with detailed dev (hot reload via node:20-alpine + pnpm dev) and prod (multi-stage Node build + nginx serve) configurations, based on implementation testing and integration with root docker-compose.yml. Added Dockerfile stubs and compose service examples for full-stack alignment.

### Frontend Bootstrap — React + Vite + Tailwind + shadcn/ui

#### Context
- Project: SaaS Invoicing System (Go 1.25 backend + PostgreSQL 18)
- Goal: Stand up a modern React SPA that consumes the existing Go API and ships a production-ready UI foundation fast.
- Reference: `docs/technical-implementation-guide.md` (frontend section) adapted to latest React and shadcn/ui blocks.

#### Problem / Users / Success
- Problem: No initialized frontend; need a robust, consistent UI system with auth and a dashboard scaffold.
- Users: SaaS owners and team members managing clients, invoices, and payments.
- Success:
  - ✅ Login page (shadcn block: login-03) authenticates against Go API and stores JWT.
  - ✅ Dashboard (shadcn block: dashboard-01) renders correctly with stats cards, charts, and invoice table.
  - ✅ Base architecture in place: routing, query cache, forms, API client, Tailwind + shadcn.
  - ✅ Docker integration for dev (hot reload) and prod (optimized build/serve).
  - ✅ Native `pnpm build` passes before container builds; Tailwind v4 utilities resolved.
  - ✅ Router configuration fixed - no more blank screen after login.

#### Scope (Essential Requirements)
- Tooling: Vite 5+, TypeScript, React (latest), pnpm.
- Styling: Tailwind CSS 4 via `@tailwindcss/vite` plugin; `src/index.css` imports Tailwind.
- UI: shadcn/ui initialized for Vite; add blocks `dashboard-01` and `login-03`.
- Routing/Data: TanStack Router v1 (file-based), TanStack Query v5, Axios API client with auth interceptor.
- Forms/Validation: React Hook Form + Zod.
- Icons: lucide-react.
- DX: Path alias `@/*`, Vite alias config, strict TS config.
- Env: `VITE_API_URL` points to Go API (default `http://localhost:8080`).
- Docker: Dev service in root compose (hot reload); prod Dockerfile (build + nginx).

#### Non-Goals (for this brief)
- Full design system/theming beyond shadcn defaults.
- Complex state management outside server-state (Query) and component state.
- Payments/billing UX.

#### High-Level Architecture
- `src/`
  - `app/` pages (TanStack Router routes): `login`, `dashboard`, `clients`, `invoices` (stubs).
  - `components/` shadcn-generated UI + feature components.
  - `lib/` `api.ts` (axios), `auth.ts` (session/JWT helpers), `utils.ts`, `validations.ts`.
  - `types/` DTOs for Client/Invoice.
  - `router.tsx` TanStack Router config + route guards.

#### Installation Plan (Commands)
```bash
# 1) Create Vite project (React + TS)
pnpm create vite@latest invoicing-frontend --template react-ts
cd invoicing-frontend
pnpm install

# 2) Tailwind v4 plugin for Vite
pnpm add tailwindcss @tailwindcss/vite

# Replace src/index.css with Tailwind import
#   @import "tailwindcss";

# 3) TypeScript path alias
# tsconfig.json → compilerOptions: { baseUrl: ".", paths: { "@/*": ["./src/*"] } }
# (add same to tsconfig.app.json if present)

# 4) Vite config
pnpm add -D @types/node

# vite.config.ts
# import path from "path";
# import tailwindcss from "@tailwindcss/vite";
# import react from "@vitejs/plugin-react";
# export default defineConfig({ plugins: [react(), tailwindcss()], resolve: { alias: { "@": path.resolve(__dirname, "./src") } } });

# 5) shadcn/ui for Vite (see: https://ui.shadcn.com/docs/installation/vite)
pnpm dlx shadcn@latest init

# 6) Add shadcn blocks
pnpm dlx shadcn@latest add dashboard-01
pnpm dlx shadcn@latest add login-03

# 7) Core libs
pnpm add @tanstack/react-router @tanstack/react-query @tanstack/react-table axios
pnpm add react-hook-form zod @hookform/resolvers lucide-react date-fns clsx tailwind-merge
```

#### Auth Strategy
- Keep backend as source of truth. POST `/api/auth/login` returns JWT.
- Store JWT (memory + localStorage) via a lightweight `authClient` or helpers in `lib/auth.ts`.
- Axios request interceptor attaches `Authorization: Bearer <token>`.
- 401 handler clears session and routes to `/login`.
- Protected routes: route guard checks token; redirect unauthenticated users.

#### Page/Feature Plan (MVP)
- Public
  - `/login` → shadcn `login-03`, form submits to backend, set session, redirect to `/dashboard`.
- Private
  - `/dashboard` → shadcn `dashboard-01` scaffold with placeholder metrics.
  - `/clients` → table stub (TanStack Table), list from `/api/clients`.
  - `/invoices` → table stub, list from `/api/invoices` (backend path per docs).

#### API Client
- `lib/api.ts` axios instance with base URL from `VITE_API_URL`.
- Interceptors: attach JWT; handle 401 → sign out + redirect `/login`.

#### Forms & Validation
- Use RHF + Zod for login and CRUD forms (clients/invoices).
- Reusable `FormField` wrappers aligned with shadcn components.

#### Environment & Docker
- `.env` (local): `VITE_API_URL=http://localhost:8080`.
- **Development Docker** (root docker-compose.yml integration):
  ```yaml
  frontend:
    image: node:20-alpine
    container_name: invoicing-frontend
    working_dir: /app
    ports:
      - "3000:5173"  # Map host 3000 to Vite 5173
    volumes:
      - ./invoicing-frontend:/app
      - /app/node_modules  # Preserve node_modules
    environment:
      - VITE_API_URL=http://host.docker.internal:8080  # Access host backend
      - CHOKIDAR_USEPOLLING=true  # Hot reload in container
    command: >
      sh -c "corepack enable pnpm &&
             pnpm install &&
             pnpm dev --host 0.0.0.0 --port 5173"
    depends_on:
      - backend
    profiles:
      - dev
      - full
  ```
  - Run: `docker compose --profile dev up` (or `make dev` from root) for hot reload during dev.
- **Native production build**: run `pnpm build` (ensures Tailwind v4 CSS compilation succeeds) prior to container builds; replace `@apply border-border` style utilities with direct CSS to avoid Tailwind v4 invalid utility errors.
- **Production Docker** (invoicing-frontend/Dockerfile):
  ```dockerfile
  # Multi-stage build
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json pnpm-lock.yaml./
  RUN corepack enable pnpm && pnpm install --frozen-lockfile
  COPY . .
  RUN pnpm build

  FROM nginx:alpine AS production
  COPY --from=builder /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/nginx.conf
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```
  - Build: `docker build -t invoicing-frontend-prod invoicing-frontend/`
  - Run: `docker run -d -p 8081:80 invoicing-frontend-prod` (avoid 8080 if already in use)
  - Compose prod: Separate `docker-compose.prod.yml` with `build: .` and env `VITE_API_URL=https://api.example.com`.
  - Optimization: Prerender if SSR not needed; gzip + caching in nginx.conf.

#### Risks / Considerations
- Version alignment: Tailwind v4 + shadcn Vite plugin must match docs.
- React latest: ensure plugin/react-refresh compatibility.
- shadcn blocks may pull additional component deps; keep components.json consistent.
- Tailwind v4: Replace deprecated `@apply border-border` style tokens with CSS variables for production builds.
- Docker dev: `host.docker.internal` for backend access (macOS/Windows); use network in Linux.
- Prod ports: Ensure host port (e.g., 8080) is free or map to alternate (8081) to avoid conflicts.
- Prod: Ensure API CORS allows frontend origin; env vars injected at build time.

#### Acceptance Criteria
- ✅ Can run `pnpm dev` and reach `/login`; submitting valid creds logs in and redirects to `/dashboard`.
- ✅ Auth persists (refresh keeps session); logout works and returns to `/login`.
- ✅ Dashboard renders without errors; router + query providers initialized.
- ✅ Dashboard shows shadcn components: SectionCards with metrics, ChartAreaInteractive, invoice table.
- ✅ Docker dev: `docker compose up` starts full stack; frontend hot-reloads changes.
- ✅ Docker prod: `pnpm build` succeeds locally, then multi-stage Docker build outputs working image; container serves app (e.g., `docker run -p 8081:80 invoicing-frontend-prod`).

#### Immediate Next Actions
1) ✅ Bootstrap Vite app (React + TS); configure Tailwind v4 and Vite alias.
2) ✅ Initialize shadcn/ui; add `dashboard-01` and `login-03` blocks.
3) ✅ Install routing/query/form libs; scaffold providers and router.
4) ✅ Implement `lib/api.ts` + auth storage and interceptors.
5) ✅ Build `/login` page and wire to backend login.
6) ✅ Build protected layout + `/dashboard` page with shadcn block.
7) ✅ Test Docker dev/prod flows; refine nginx.conf for prod.
8) ✅ **COMPLETED** - Fixed blank screen issue and integrated all shadcn components successfully.

**Ready for next phase**: Frontend foundation complete. Can now focus on:
- API integration for real data (replace mock data)
- Additional pages (clients, invoices CRUD)
- Advanced features (search, filtering, pagination)
