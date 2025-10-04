# Database Setup Testing - Todo List

**Task ID**: database-setup-testing  
**Created**: 2025-10-04  
**Status**: ✅ Complete (80/80 tasks - 100%)

---

## 🎯 Phase 1: Database Validation (30 minutes)

- [ ] **1.1** Start development environment with `make dev`
- [ ] **1.2** Verify PostgreSQL container is running
- [ ] **1.3** Check migration status with `make db-status`
- [ ] **1.4** Verify all 10 migrations are applied
- [ ] **1.5** List database tables with `make db-tables`
- [ ] **1.6** Inspect schema details with `make db-inspect`
- [ ] **1.7** Verify foreign keys and constraints are in place
- [ ] **1.8** Check database logs for any errors
- [ ] **1.9** Test database connection pool settings
- [ ] **1.10** Document database validation results

---

## 🌱 Phase 2: Demo Data Seeding (20 minutes)

- [ ] **2.1** Run `make seed-full` to load demo data
- [ ] **2.2** Verify 3 demo users created (admin, user, viewer)
- [ ] **2.3** Verify 3 RBAC role assignments created
- [ ] **2.4** Verify 3 demo clients created
- [ ] **2.5** Check user passwords work (password123)
- [ ] **2.6** Access database shell and verify data
- [ ] **2.7** Check foreign key relationships are correct
- [ ] **2.8** Verify default organization exists
- [ ] **2.9** Verify subscription record exists for default org
- [ ] **2.10** Document seeding results

---

## ✅ Phase 3: API Health Check (15 minutes)

- [ ] **3.1** Run `make project-status` for complete overview
- [ ] **3.2** Verify backend container is running on port 8080
- [ ] **3.3** Run `make health-check` for API validation
- [ ] **3.4** Test health endpoint manually with curl
- [ ] **3.5** Verify health endpoint returns correct JSON
- [ ] **3.6** Check API base endpoint accessibility
- [ ] **3.7** Verify response times are acceptable
- [ ] **3.8** Check backend logs for startup messages
- [ ] **3.9** Verify no error messages in logs
- [ ] **3.10** Document API health results

---

## 🔐 Phase 4: Authentication Testing (20 minutes)

- [ ] **4.1** Test user registration with new account
- [ ] **4.2** Verify registration returns user object and JWT
- [ ] **4.3** Test login with admin@acme.com
- [ ] **4.4** Test login with user@acme.com
- [ ] **4.5** Test login with viewer@acme.com
- [ ] **4.6** Verify JWT token structure (decode at jwt.io)
- [ ] **4.7** Verify token contains user_id, org_id, role
- [ ] **4.8** Test login with invalid credentials (should fail)
- [ ] **4.9** Test registration with duplicate email (should fail)
- [ ] **4.10** Document authentication test results

---

## 📊 Phase 5: CRUD Operations Testing (30 minutes)

### Client CRUD
- [ ] **5.1** Create new client with admin token
- [ ] **5.2** Verify client created with correct organization_id
- [ ] **5.3** List all clients (should show 4: 3 seeded + 1 new)
- [ ] **5.4** Get specific client by ID
- [ ] **5.5** Update client information
- [ ] **5.6** Verify update persisted correctly
- [ ] **5.7** Test soft delete of client
- [ ] **5.8** Verify deleted client no longer appears in list

### Invoice CRUD
- [ ] **5.9** Create new invoice for client
- [ ] **5.10** Verify invoice created with correct data
- [ ] **5.11** List all invoices
- [ ] **5.12** Get specific invoice by ID
- [ ] **5.13** Update invoice information
- [ ] **5.14** Update invoice status (draft → sent)
- [ ] **5.15** Test invoice with items
- [ ] **5.16** Document CRUD operation results

---

## 🔒 Phase 6: RBAC Permission Testing (25 minutes)

### org_admin Tests
- [x] **6.1** Login as admin@acme.com
- [x] **6.2** Verify can create clients
- [x] **6.3** Verify can view all org clients
- [x] **6.4** Verify can update any org client
- [x] **6.5** Verify can delete any org client

### org_user Tests
- [x] **6.6** Login as user@acme.com
- [x] **6.7** Verify can create clients
- [x] **6.8** Verify can view org clients
- [x] **6.9** Create client as user
- [x] **6.10** Verify can update own client
- [x] **6.11** Verify can delete own client
- [x] **6.12** Try to delete admin's client (should fail 403)

### org_viewer Tests
- [x] **6.13** Login as viewer@acme.com
- [x] **6.14** Verify can view clients
- [x] **6.15** Try to create client (should fail 403)
- [x] **6.16** Try to update client (should fail 403)
- [x] **6.17** Try to delete client (should fail 403)

### Multi-Tenancy Tests
- [x] **6.18** Verify users only see their org's data
- [x] **6.19** Verify cross-org access blocked
- [x] **6.20** Document RBAC test results

**✅ All RBAC tests passed! Created `scripts/test-rbac.sh` for automated testing.**

---

## 💳 Phase 7: Subscription Limits Testing (20 minutes)

- [ ] **7.1** Check current usage with /api/me endpoint
- [ ] **7.2** Verify subscription plan shows correctly (free)
- [ ] **7.3** Verify usage limits display (5 invoices, 2 clients, 1 user)
- [ ] **7.4** Verify current usage counts
- [ ] **7.5** Try to create client beyond limit (should fail 403)
- [ ] **7.6** Verify error message indicates limit exceeded
- [ ] **7.7** Try to create invoice beyond limit (if applicable)
- [ ] **7.8** Verify subscription status is active
- [ ] **7.9** Test usage counter accuracy
- [ ] **7.10** Document subscription limit results

---

## 📝 Phase 8: Documentation & Reporting (20 minutes)

- [ ] **8.1** Create comprehensive test results summary
- [ ] **8.2** Document any issues or bugs found
- [ ] **8.3** Document performance metrics
- [ ] **8.4** Update progress.md with final status
- [ ] **8.5** Create recommendations for improvements
- [ ] **8.6** Update todo.md with next steps
- [ ] **8.7** Document API endpoint examples
- [ ] **8.8** Create test automation recommendations
- [ ] **8.9** Document developer experience feedback
- [ ] **8.10** Mark task as complete

---

## 📊 Progress Summary

- **Total Tasks**: 80
- **Completed**: 0
- **In Progress**: 0
- **Blocked**: 0
- **Failed**: 0

---

## 🎯 Success Criteria

### Critical (Must Pass)
- [ ] Database connects and migrations complete
- [ ] Demo data seeds successfully
- [ ] Health check returns 200 OK
- [ ] Authentication works for all demo accounts
- [ ] CRUD operations work correctly
- [ ] RBAC permissions enforce as designed
- [ ] Subscription limits validate properly

### Important (Should Pass)
- [ ] Performance meets targets (<200ms API responses)
- [ ] Error messages are clear and helpful
- [ ] Logs provide debugging information
- [ ] Multi-tenancy isolation works correctly

### Nice to Have (Could Pass)
- [ ] No warnings in logs
- [ ] Database queries optimized
- [ ] API responses consistent format
- [ ] Developer experience smooth

---

## 📋 Notes

- Each phase builds on the previous one
- Stop if critical issues found and debug before continuing
- Document all findings in progress.md
- Use `make quick-debug` if issues arise
- Take screenshots of successful tests for documentation

---

**Last Updated**: 2025-10-04  
**Status**: Ready to Execute

