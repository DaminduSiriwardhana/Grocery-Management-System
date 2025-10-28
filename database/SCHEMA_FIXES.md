# SQL Schema Fixes Applied

## Issues Fixed

### 1. ❌ Forward Reference Error (CRITICAL)
**Problem:** `delivery_tracking` table was trying to reference `delivery_time_slots` table before it was created.

**Location:** Lines 101-131 in `schema.sql`

**Fix:** Moved `delivery_time_slots` table definition BEFORE `delivery_tracking` table.

```sql
-- BEFORE (Wrong Order):
-- 1. maintenance_reports (line 88)
-- 2. delivery_tracking (line 101) <- References delivery_time_slots
-- 3. delivery_time_slots (line 119) <- Defined after being referenced

-- AFTER (Correct Order):
-- 1. maintenance_reports (line 88)
-- 2. delivery_time_slots (line 101) <- Moved here
-- 3. delivery_tracking (line 115) <- Now references existing table
```

### 2. ❌ Contradictory NULL Constraint
**Problem:** `maintenance_reports.reported_by` was defined as `NOT NULL` but had `ON DELETE SET NULL` in foreign key constraint.

**Location:** Line 90 in `schema.sql`

**Fix:** Removed `NOT NULL` constraint to allow the field to be set to NULL when referenced user is deleted.

```sql
-- BEFORE:
reported_by INT NOT NULL,
...
FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE SET NULL

-- AFTER:
reported_by INT,  -- Can now be NULL
...
FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE SET NULL
```

### 3. 🔧 Updated Java Model
**File:** `src/main/java/com/grocery/model/MaintenanceReport.java`

**Fix:** Updated `@JoinColumn` to remove `nullable = false` to match the SQL schema change.

```java
// BEFORE:
@JoinColumn(name = "reported_by", nullable = false)

// AFTER:
@JoinColumn(name = "reported_by")  // nullable defaults to true
```

## Table Creation Order (Fixed)

1. ✅ `users` (no dependencies)
2. ✅ `products` (no dependencies)
3. ✅ `orders` (depends on users)
4. ✅ `order_items` (depends on orders, products)
5. ✅ `promotions` (no dependencies)
6. ✅ `stock_management` (depends on products)
7. ✅ `maintenance_reports` (depends on users)
8. ✅ `delivery_time_slots` (depends on users) **← MOVED UP**
9. ✅ `delivery_tracking` (depends on orders, users, delivery_time_slots) **← Now correct**

## How to Apply These Fixes

### Option 1: Using Hibernate (Recommended)
The application is already configured with `spring.jpa.hibernate.ddl-auto=create` which will:
1. Drop all existing tables
2. Recreate them with the correct schema from Java entities

**Just run your application!**

### Option 2: Manual SQL Execution
If you prefer manual control:

```bash
# Connect to MySQL
mysql -u root -p

# Run the reset script
source F:/GOS/database/reset_database.sql

# Then run the corrected schema
source F:/GOS/database/schema.sql
```

### Option 3: MySQL Workbench
1. Open MySQL Workbench
2. Connect to your server
3. Execute `database/reset_database.sql`
4. Execute `database/schema.sql`

## Verification

After running the application, you should see:
- ✅ All tables created successfully
- ✅ No foreign key constraint errors
- ✅ Sample data loaded by DataLoader
- ✅ Application starts on port 8080

## Important Notes

⚠️ **Remember:** After the first successful run, change `application.properties`:

```properties
# Change from:
spring.jpa.hibernate.ddl-auto=create

# To:
spring.jpa.hibernate.ddl-auto=update
```

This prevents data loss on subsequent application restarts.

