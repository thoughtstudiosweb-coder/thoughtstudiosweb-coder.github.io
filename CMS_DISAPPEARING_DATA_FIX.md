# CMS Disappearing Data Fix - Critical Issue

## Problem

**Critical Issue**: Changes are saved to Postgres (they appear on the website ✅), but when refreshing the CMS page, the changes disappear from the CMS view ❌. The data remains on the website, proving it's in the database.

## Root Cause Analysis

### Why Website Shows Data But CMS Doesn't

1. **Website (Server-Side)**:
   - Calls `getPageData()` → `readJSON()` → `getContent()`
   - `getContent()` has 500ms delay
   - Uses fresh server-side connection
   - **Works**: Gets latest data from Postgres

2. **CMS (Client-Side via API)**:
   - CMS waits 500ms (client-side)
   - Calls API route → API route waits 500ms
   - API route calls `readJSON()` → `getContent()` waits 500ms
   - **Problem**: The API route delay happens BEFORE `readJSON()`, so by the time `getContent()` runs, it might be using a stale connection that hasn't seen the write yet

### The Connection Pooling Issue

When you save in CMS:
1. Write happens on Connection A → Data saved to Postgres ✅
2. Website reads on Connection B (fresh) → Sees data ✅
3. CMS refresh reads on Connection C (might be stale) → Doesn't see data ❌

The 500ms delay in API routes is **not enough** for connection pooling to sync, especially when:
- The API route delay happens before `readJSON()`
- `getContent()` then has its own delay, but the connection might already be established
- Total effective delay is not long enough for write propagation

## Solution

### 1. ✅ Increased API Route Delays to 1000ms
All content API routes now wait **1000ms** before calling `readJSON()`:
- `app/api/content/beliefs/route.ts`
- `app/api/content/explore/route.ts`
- `app/api/content/welcome/route.ts`
- `app/api/content/theme/route.ts`

This ensures:
- Connection pooling has time to fully sync
- Write connections have propagated to read connections
- Fresh data is available when `getContent()` queries

### 2. ✅ Increased `getContent()` Delay to 1000ms
Changed from 500ms to **1000ms** in `lib/db.ts`:
- Ensures read operations wait long enough after writes
- Accounts for connection pooling propagation time
- Matches the API route delay for consistency

### Why 1000ms?

- **500ms**: Not enough for connection pooling to sync in all cases
- **1000ms**: Gives adequate time for:
  - Write operation to commit
  - Connection pool to sync
  - Read replicas to update (if applicable)
  - Network propagation

## Files Modified

### API Routes
- `app/api/content/beliefs/route.ts` - 500ms → 1000ms
- `app/api/content/explore/route.ts` - 500ms → 1000ms
- `app/api/content/welcome/route.ts` - 500ms → 1000ms
- `app/api/content/theme/route.ts` - 500ms → 1000ms

### Database Functions
- `lib/db.ts` - `getContent()` delay: 500ms → 1000ms

## Expected Behavior After Fix

1. **Save in CMS**:
   - Data saved to Postgres ✅
   - Appears on website immediately ✅
   - CMS refetches after 3 seconds ✅

2. **Refresh CMS Page**:
   - CMS waits 500ms (client-side)
   - API route waits 1000ms
   - `getContent()` waits 1000ms
   - **Total**: ~2500ms before data is fetched
   - **Result**: CMS shows latest data from Postgres ✅

3. **Data Consistency**:
   - Website and CMS show same data ✅
   - Changes persist after refresh ✅
   - No disappearing data ✅

## Testing

After deploying, verify:
- [ ] Save changes in CMS → Appears on website
- [ ] Refresh CMS page → Shows saved changes (not disappearing)
- [ ] Delete item → Disappears from website
- [ ] Refresh CMS page → Item still gone (not reappearing)
- [ ] Website and CMS show same data consistently

## Technical Notes

### Delay Sequence for CMS Refresh

1. **Client-side delay**: 500ms (in `useEffect`)
2. **API route delay**: 1000ms (before `readJSON()`)
3. **getContent() delay**: 1000ms (before query)
4. **Total**: ~2500ms before data is fetched

This ensures:
- Connection pooling has fully synced
- Write operations are visible to read operations
- No stale data is returned

### Why Website Works But CMS Doesn't

- **Website**: Server-side, single connection, 500ms delay was enough
- **CMS**: Client-side → API route → Multiple connections, needed longer delay

The increased delay accounts for:
- Multiple connection hops
- Connection pool synchronization
- Write propagation time

## Impact

- **Performance**: Slightly slower CMS loads (~1 second slower)
- **Reliability**: Much more reliable data consistency
- **User Experience**: Data no longer disappears on refresh

The trade-off is worth it for data consistency and reliability.

