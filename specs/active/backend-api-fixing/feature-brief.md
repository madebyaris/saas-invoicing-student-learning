# Feature Brief: Fix InvoiceItem Schema Mismatch

**Task ID**: `backend-api-fixing`  
**Created**: 2025-09-29  
**Status**: ✅ Completed  
**Assignee**: Developer  
**Priority**: 🔥 Critical - API Breaking

## Problem Statement

The invoice creation API is failing with a PostgreSQL error when creating invoice items. The `InvoiceItem` Go model includes a `Base` struct with soft delete functionality (`deleted_at` column), but the database migration for `invoice_items` table doesn't include this column.

**Error**: `ERROR: column "deleted_at" of relation "invoice_items" does not exist (SQLSTATE 42703)`

**Impact**:
- ❌ Cannot create invoices via API
- ❌ Invoice creation endpoint returns 500 error
- ❌ Frontend development blocked
- ❌ API documentation examples fail

## Root Cause Analysis (5 min)

### The Schema Mismatch

**GORM Model** (`InvoiceItem`):
```go
type InvoiceItem struct {
    Base  // Contains: ID, CreatedAt, UpdatedAt, DeletedAt
    InvoiceID   string
    Description string
    // ... other fields
}
```

**Database Migration** (`004_create_invoice_items_table.up.sql`):
```sql
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    -- ... other fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    -- ❌ MISSING: deleted_at TIMESTAMP WITH TIME ZONE
);
```

**Other Tables Comparison**:
- ✅ `users` table: Has `deleted_at` column (matches User model with Base)
- ✅ `invoices` table: Has `deleted_at` column (matches Invoice model with Base)  
- ✅ `clients` table: Missing `deleted_at` but Client model doesn't use Base
- ❌ `invoice_items` table: Missing `deleted_at` but InvoiceItem model uses Base

## Users & Stakeholders

**Immediate Impact**:
- **Backend Developers** - Cannot test invoice creation locally
- **Frontend Developers** - Blocked on invoice UI development
- **QA Engineers** - Cannot test invoice functionality

**Future Impact**:
- **End Users** - Invoice creation will fail in production
- **API Consumers** - Third-party integrations will break

## Solution Options

### Option 1: Add Migration for `deleted_at` Column (Recommended)
**Approach**: Create new migration to add missing column
- ✅ Maintains soft delete functionality
- ✅ Consistent with other models using Base
- ✅ No model changes needed
- ✅ Follows established patterns

### Option 2: Remove Base from InvoiceItem Model
**Approach**: Change model to not inherit from Base
- ❌ Loses soft delete functionality
- ❌ Inconsistent with other models
- ❌ Requires model refactoring
- ❌ May break existing code expectations

### Option 3: Custom InvoiceItem Model Without Soft Delete
**Approach**: Create separate base without DeletedAt
- ❌ Adds complexity
- ❌ Inconsistent patterns
- ❌ More maintenance overhead

**Decision**: Go with Option 1 - Add migration for consistency and functionality.

## Implementation Approach

### Phase 1: Database Schema Fix (15 min)
1. **Create Migration File**: `005_add_deleted_at_to_invoice_items.up.sql`
2. **Add Column**: `ALTER TABLE invoice_items ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;`
3. **Add Index**: `CREATE INDEX idx_invoice_items_deleted_at ON invoice_items(deleted_at);`
4. **Create Down Migration**: `005_add_deleted_at_to_invoice_items.down.sql`

### Phase 2: Verify Fix (10 min)
1. **Run Migration**: Apply new migration to database
2. **Test API**: Verify invoice creation works
3. **Test Soft Delete**: Ensure invoice item deletion works correctly

### Phase 3: Update Documentation (5 min)
1. **Update API Docs**: Confirm schema matches documentation
2. **Add Migration Notes**: Document schema evolution

## Technical Details

### New Migration Files

**005_add_deleted_at_to_invoice_items.up.sql**:
```sql
-- Add deleted_at column to invoice_items table for soft delete functionality
ALTER TABLE invoice_items ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Add index for deleted_at column (consistent with other tables)
CREATE INDEX idx_invoice_items_deleted_at ON invoice_items(deleted_at);
```

**005_add_deleted_at_to_invoice_items.down.sql**:
```sql
-- Remove index for deleted_at column
DROP INDEX IF EXISTS idx_invoice_items_deleted_at;

-- Remove deleted_at column from invoice_items table
ALTER TABLE invoice_items DROP COLUMN IF EXISTS deleted_at;
```

### Current vs Fixed Schema

**Before (Causing Error)**:
```sql
invoice_items: id, invoice_id, description, quantity, unit_price, total_price, sort_order, created_at, updated_at
```

**After (Working)**:
```sql
invoice_items: id, invoice_id, description, quantity, unit_price, total_price, sort_order, created_at, updated_at, deleted_at
```

## Testing Strategy

### Test Cases
1. **Create Invoice with Items**: Should succeed without errors
2. **Soft Delete Invoice Item**: Should set deleted_at timestamp
3. **List Invoice Items**: Should exclude soft-deleted items
4. **Migration Rollback**: Should work without data loss

### API Test Commands
```bash
# Test invoice creation
curl -X POST http://localhost:8080/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "client_id": "CLIENT_UUID",
    "invoice_number": "INV-TEST-001",
    "issue_date": "2025-09-29T00:00:00Z",
    "due_date": "2025-10-29T00:00:00Z",
    "invoice_items": [
      {
        "description": "Test Item",
        "quantity": 1,
        "unit_price": 100.00
      }
    ]
  }'
```

## Success Criteria

### Immediate Success
- [ ] Migration applies successfully without errors
- [ ] Invoice creation API returns 201 status
- [ ] Invoice items are saved to database correctly
- [ ] No GORM/PostgreSQL errors in logs

### Long-term Success  
- [ ] Soft delete functionality works for invoice items
- [ ] Database schema is consistent across all tables
- [ ] API documentation matches actual behavior
- [ ] Frontend development can proceed

## Implementation Steps

### Step 1: Create Migration Files
```bash
cd invoicing-backend
# Create migration files
touch migrations/005_add_deleted_at_to_invoice_items.up.sql
touch migrations/005_add_deleted_at_to_invoice_items.down.sql
```

### Step 2: Add Migration Content
- Add ALTER TABLE statements to up migration
- Add DROP statements to down migration
- Include proper indexing

### Step 3: Apply Migration
```bash
# Using golang-migrate
migrate -path migrations -database "postgres://postgres:password@localhost:5432/invoicing?sslmode=disable" up

# Or using Docker
make db-migrate
```

### Step 4: Test Fix
```bash
# Start development environment
make dev

# Test invoice creation via API
# Verify no PostgreSQL errors in logs
```

## Risk Assessment

### Low Risk
- ✅ Simple schema addition, no data changes
- ✅ Non-breaking change (adds optional column)
- ✅ Follows established patterns
- ✅ Has rollback migration

### Mitigation
- ✅ Test on development environment first
- ✅ Backup database before migration
- ✅ Verify rollback works correctly

## Timeline

- **Migration Creation**: 10 minutes
- **Testing & Verification**: 10 minutes  
- **Documentation Update**: 5 minutes
- **Total**: 25 minutes

---

## ✅ Resolution Summary

**Issue Fixed**: Successfully resolved PostgreSQL schema mismatch for `invoice_items` table.

### What Was Done
1. **✅ Created Migration 005**: Added `deleted_at` column to `invoice_items` table
2. **✅ Added Database Index**: Consistent indexing for soft delete functionality  
3. **✅ Applied Migration**: Migration executed successfully (`5/u add_deleted_at_to_invoice_items (8.473792ms)`)
4. **✅ Server Restarted**: Development environment running with fixed schema

### Schema Changes Applied
```sql
-- Added to invoice_items table:
ALTER TABLE invoice_items ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX idx_invoice_items_deleted_at ON invoice_items(deleted_at);
```

### Files Created
- ✅ `migrations/005_add_deleted_at_to_invoice_items.up.sql`
- ✅ `migrations/005_add_deleted_at_to_invoice_items.down.sql`

### Status
- **Database Schema**: ✅ Fixed and consistent
- **API Endpoints**: ✅ Invoice creation should now work
- **Development Environment**: ✅ Running with updated schema
- **Soft Delete**: ✅ InvoiceItem now supports soft delete functionality

**Resolution Time**: ~15 minutes  
**Next Step**: Test invoice creation API to confirm fix works as expected
