# Invoicing Frontend

Modern React frontend for the SaaS Invoicing System with full authentication, protected routes, and Docker integration.

## Tech Stack

- **React 19 RC** - Latest React with TypeScript
- **Vite 7.1.9** - Lightning-fast build tool with hot reload
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components (dashboard-01, login-03)
- **TanStack Router v1** - Type-safe code-based routing
- **TanStack Query v5** - Server state management
- **React Hook Form + Zod** - Form validation
- **Axios** - HTTP client with JWT interceptors
- **Sonner** - Toast notifications

## Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
# → http://localhost:5173

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Docker Development (Recommended)

```bash
# From project root - start full stack
docker compose --profile dev up

# Access services
Frontend: http://localhost:3000
Backend:  http://localhost:8080
pgAdmin:  http://localhost:5050
```

### Docker Production

```bash
# Build production image
docker build -t invoicing-frontend-prod .

# Run container
docker run -d -p 80:80 invoicing-frontend-prod

# Or use docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
```

## Authentication

### Test Credentials
```
Email:    admin@invoicing.com
Password: password123
```

### Create New User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

## Environment Variables

Create `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080
```

### Docker Environment
- **Development**: `VITE_API_URL=http://localhost:8080` (browser perspective)
- **Production**: `VITE_API_URL=https://api.yourdomain.com`

## Project Structure

```
invoicing-frontend/
├── src/
│   ├── app/              # Page components
│   │   ├── dashboard.tsx # Dashboard page (protected)
│   │   └── login.tsx     # Login page (public)
│   ├── components/       # Reusable components
│   │   ├── forms/       # Form components
│   │   │   └── LoginForm.tsx
│   │   ├── layout/      # Layout components
│   │   │   └── ProtectedLayout.tsx
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utilities and helpers
│   │   ├── api.ts       # Axios client with JWT
│   │   ├── auth.ts      # Auth helpers
│   │   ├── utils.ts     # Utility functions
│   │   └── validations.ts # Zod schemas
│   ├── types/           # TypeScript types
│   │   ├── api.ts       # API response types
│   │   ├── client.ts    # Client types
│   │   └── invoice.ts   # Invoice types
│   ├── router.tsx       # TanStack Router config
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── Dockerfile           # Multi-stage production build
├── nginx.conf           # Production nginx config
├── components.json      # shadcn/ui config
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript config
```

## Features

### ✅ Implemented
- [x] User authentication (login/logout)
- [x] JWT token management with auto-refresh
- [x] Protected routes with auth guards
- [x] Login page with shadcn/ui login-03 block
- [x] Dashboard page with shadcn/ui dashboard-01 block
- [x] API client with Axios interceptors
- [x] Form validation with React Hook Form + Zod
- [x] Toast notifications with Sonner
- [x] Docker development with hot reload
- [x] Docker production with nginx
- [x] TypeScript type safety throughout

### 🚧 Coming Soon
- [ ] Client management CRUD UI
- [ ] Invoice management CRUD UI
- [ ] Data tables with TanStack Table
- [ ] Real-time dashboard metrics
- [ ] Invoice PDF generation
- [ ] Multi-organization support
- [ ] Role-based access control UI

## Development

### Adding shadcn/ui Components

```bash
# Add individual components
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card

# Add blocks (pre-built component sets)
pnpm dlx shadcn@latest add dashboard-01
pnpm dlx shadcn@latest add login-03
```

### API Integration

The API client (`src/lib/api.ts`) automatically:
- Adds JWT token to requests
- Handles 401 errors (auto-redirect to login)
- Uses environment-based API URL

```typescript
import { apiClient } from '@/lib/api';

// Example: Fetch clients
const response = await apiClient.get('/api/clients');

// Example: Create invoice
const invoice = await apiClient.post('/api/invoices', data);
```

### Authentication Helpers

```typescript
import { useAuth } from '@/lib/auth';

const { login, logout, isAuthenticated, token } = useAuth();

// Login
await login('user@example.com', 'password');

// Logout
logout();

// Check auth status
if (isAuthenticated()) {
  // User is logged in
}
```

## Troubleshooting

### CORS Errors
Ensure backend CORS middleware allows `http://localhost:3000`:
```go
AllowOrigins: []string{
  "http://localhost:3000",
  "http://127.0.0.1:3000",
}
```

### Hot Reload Not Working in Docker
Enable polling in docker-compose.yml:
```yaml
environment:
  - CHOKIDAR_USEPOLLING=true
```

### Build Errors with Tailwind v4
Don't use `@apply` with custom utility classes. Use direct CSS variables:
```css
/* ❌ Don't do this */
@apply border-border;

/* ✅ Do this instead */
border-color: hsl(var(--border));
```

### Port Already in Use
Change port mapping in docker-compose.yml:
```yaml
ports:
  - "3001:5173"  # Use different host port
```

## Testing

### Manual Testing
1. Start dev server: `docker compose --profile dev up`
2. Navigate to: `http://localhost:3000/login`
3. Login with: `admin@invoicing.com` / `password123`
4. Verify redirect to dashboard
5. Check JWT in localStorage
6. Logout and verify redirect to login

### API Testing
```bash
# Test backend health
curl http://localhost:8080/health

# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@invoicing.com","password":"password123"}'
```

## Production Deployment

### Build Optimization
- Multi-stage Docker build
- Nginx with gzip compression
- Static asset caching (1 year)
- Security headers (CSP, XSS, etc.)
- SPA routing support

### Nginx Configuration
See `nginx.conf` for:
- Gzip compression
- Security headers
- Static asset caching
- SPA routing (try_files)
- Optional API proxy

## License

MIT