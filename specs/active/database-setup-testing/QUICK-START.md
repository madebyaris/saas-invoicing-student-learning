# Database Setup Testing - Quick Start Guide

## 🚀 TL;DR - Fast Track (15 minutes)

```bash
# 1. Start everything
make dev

# 2. Seed demo data
make seed-full

# 3. Check status
make project-status

# 4. Test API
make health-check
make api-test

# 5. Manual test (get JWT token)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"password123"}'
```

## 📋 Demo Accounts
- **Admin**: admin@acme.com / password123 (org_admin)
- **User**: user@acme.com / password123 (org_user)
- **Viewer**: viewer@acme.com / password123 (org_viewer)

## 🎯 7-Phase Testing Plan

### Phase 1: Database (5 min)
```bash
make dev
make db-status
make db-tables
```

### Phase 2: Demo Data (3 min)
```bash
make seed-full
make db-tables  # Should show 3 users, 3 clients
```

### Phase 3: Health Check (2 min)
```bash
make health-check
curl http://localhost:8080/health
```

### Phase 4: Authentication (5 min)
```bash
# Login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"password123"}'

# Save the token
export TOKEN="jwt.token.from.response"
```

### Phase 5: CRUD (10 min)
```bash
# List clients
curl http://localhost:8080/api/clients \
  -H "Authorization: Bearer $TOKEN"

# Create client
curl -X POST http://localhost:8080/api/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Client",
    "email": "test@client.com",
    "company_name": "Test Client Co",
    "address_line1": "123 Test St",
    "address_city": "San Francisco",
    "address_country": "USA",
    "address_postal_code": "94102"
  }'
```

### Phase 6: RBAC (10 min)
```bash
# Login as viewer
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@acme.com","password":"password123"}'

export VIEWER_TOKEN="token.here"

# Try to create (should fail with 403)
curl -X POST http://localhost:8080/api/clients \
  -H "Authorization: Bearer $VIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Should Fail"}'
```

### Phase 7: Limits (5 min)
```bash
# Check current usage
curl http://localhost:8080/api/me \
  -H "Authorization: Bearer $TOKEN"

# Try to exceed limit (free plan: 2 clients max)
# We have 3 from seed, so next one should fail
curl -X POST http://localhost:8080/api/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Over Limit",...}'
```

## ✅ Success Checklist

- [ ] Database connects (make db-status shows migrations)
- [ ] Demo data loaded (3 users, 3 clients)
- [ ] Health check returns 200
- [ ] Login works and returns JWT
- [ ] Can create/list/view clients
- [ ] Can create/list/view invoices
- [ ] org_viewer can't create (403)
- [ ] org_user can only delete own resources
- [ ] Usage limits enforce (403 over limit)

## 🐛 Troubleshooting

### Services not starting?
```bash
make clean
make dev
make logs
```

### Database issues?
```bash
make db-reset
make dev
make seed-full
```

### API not responding?
```bash
make quick-debug
make health-check
```

### Need fresh start?
```bash
make clean
make setup
make dev
make seed-full
```

## 📊 Useful Commands

```bash
make project-status   # Complete overview
make quick-debug      # Instant diagnostics
make logs             # View all logs
make db-shell         # PostgreSQL access
make db-inspect       # Schema details
make code-stats       # Project metrics
```

## 🎓 Next Steps

1. ✅ Complete all 7 phases
2. ✅ Verify all checkboxes
3. ✅ Document any issues found
4. 🚀 Move to frontend setup: `/brief frontend-setup`

---

**Total Time**: ~40 minutes  
**Difficulty**: Easy (just validation)  
**Goal**: Confidence in backend foundation

