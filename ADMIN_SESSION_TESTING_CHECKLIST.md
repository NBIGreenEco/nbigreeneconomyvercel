# ✅ ADMIN SESSION FLOW - TESTING CHECKLIST

## Pre-Test Setup

- [ ] Hard refresh browser: `Ctrl+Shift+R`
- [ ] Open DevTools: `F12`
- [ ] Go to Console tab
- [ ] Clear any old sessions: Press `Ctrl+Shift+Delete` to clear site data

---

## Test 1: Sign In Flow

### Steps
1. Navigate to: `/LandingPage/SignInAndSignUp/SignIn.html`
2. Enter email: `nbigreeneconomy@gmail.com`
3. Password: [your admin password]
4. Click "Sign In" button

### Expected Console Output
```
✅ Admin session stored: nbigreeneconomy@gmail.com
✅ Is Admin: true
✅ Email Verified: true
✅ Login successful
```

### Verification
- [ ] "Sign In" button is not disabled
- [ ] Page redirects (to Dashboard or Questionnaire)
- [ ] Console shows: `✅ Admin session stored`
- [ ] Console shows: `✅ Is Admin: true`

**Result:** ⏳ PASS / ❌ FAIL

---

## Test 2: Admin Session Persistence

### Steps
1. From Test 1, user is now signed in
2. Navigate to: `/ADMIN/ManageOpprtunities.html`
3. Open DevTools Console (F12)

### Expected Console Output
```
✅ Found valid admin session: nbigreeneconomy@gmail.com
✨ HAS ADMIN ACCESS: YES ✅
📋 Page initialized with admin: nbigreeneconomy@gmail.com
```

### Verification
- [ ] Page loads (doesn't redirect to SignIn)
- [ ] Opportunities table displays
- [ ] Console shows: `✅ Found valid admin session`
- [ ] Console shows: `✨ HAS ADMIN ACCESS: YES`

**Result:** ⏳ PASS / ❌ FAIL

---

## Test 3: Create Opportunity

### Steps
1. On `/ADMIN/ManageOpprtunities.html`
2. Click "Add Opportunity" button
3. Fill in form:
   - Title: "Test Opportunity 001"
   - Category: "Energy" (or any category)
   - Description: "This is a test opportunity"
   - Link: "https://example.com"
   - Link Text: "Learn More"
4. Click "Submit" button

### Expected Console Output
```
👤 Admin session confirmed: nbigreenelectronomy@gmail.com
✅ Opportunity created by: nbigreeneconomy@gmail.com
✅ Opportunity added successfully.
✅ Firestore query successful, found X opportunities
```

### Verification
- [ ] No error messages appear
- [ ] Success alert shows: "✅ Opportunity added successfully."
- [ ] Modal closes automatically
- [ ] New opportunity appears in table
- [ ] Console shows: `👤 Admin session confirmed`
- [ ] Console shows: `✅ Opportunity created by`

**Result:** ⏳ PASS / ❌ FAIL

---

## Test 4: Verify in Firestore

### Steps
1. Go to: https://console.firebase.google.com/
2. Select project: "nbi-green-economy"
3. Go to: "Firestore Database"
4. Go to: "Collections"
5. Open: "opportunities"
6. Find your newly created opportunity (title: "Test Opportunity 001")
7. Click to open document

### Expected Data
```
Field: name
Value: "Test Opportunity 001"

Field: createdBy
Value: "nbigreeneconomy@gmail.com"

Field: updatedBy
Value: "nbigreeneconomy@gmail.com"

Field: createdAt
Value: [timestamp of creation]

Field: updatedAt
Value: [timestamp of creation]
```

### Verification
- [ ] Document exists in Firestore
- [ ] Document has field: `createdBy`
- [ ] `createdBy` value is: `nbigreeneconomy@gmail.com`
- [ ] Document has field: `updatedBy`
- [ ] `updatedBy` value is: `nbigreeneconomy@gmail.com`
- [ ] Document has field: `createdAt` (timestamp)
- [ ] Document has field: `updatedAt` (timestamp)

**Result:** ⏳ PASS / ❌ FAIL

---

## Test 5: Update Opportunity

### Steps
1. On `/ADMIN/ManageOpprtunities.html`
2. Find your test opportunity in the table
3. Click "Edit" button on the row
4. Change Title to: "Test Opportunity 001 - UPDATED"
5. Click "Submit" button

### Expected Console Output
```
👤 Admin session confirmed: nbigreeneconomy@gmail.com
✅ Opportunity updated by: nbigreeneconomy@gmail.com
✅ Opportunity updated successfully.
```

### Verification
- [ ] Modal opens with existing data pre-filled
- [ ] Can edit the title
- [ ] No error messages appear
- [ ] Success alert shows: "✅ Opportunity updated successfully."
- [ ] Modal closes
- [ ] Title in table updates to new value
- [ ] Console shows: `✅ Opportunity updated by`

**Result:** ⏳ PASS / ❌ FAIL

---

## Test 6: Verify Update in Firestore

### Steps
1. In Firebase Console, same opportunity document
2. Refresh the page (F5)
3. Look at the `updatedAt` timestamp

### Expected Data
```
Field: name
Value: "Test Opportunity 001 - UPDATED"

Field: updatedBy
Value: "nbigreeneconomy@gmail.com"

Field: updatedAt
Value: [NEW timestamp - should be later than createdAt]
```

### Verification
- [ ] Document shows updated title
- [ ] `updatedBy` field is: `nbigreeneconomy@gmail.com`
- [ ] `updatedAt` timestamp is newer than `createdAt`

**Result:** ⏳ PASS / ❌ FAIL

---

## Test 7: Delete Opportunity

### Steps
1. On `/ADMIN/ManageOpprtunities.html`
2. Find your test opportunity in the table
3. Click "Delete" button on the row
4. Confirm by clicking "Confirm Delete" in modal

### Expected Console Output
```
👤 Admin session confirmed for delete: nbigreeneconomy@gmail.com
✅ Opportunity deleted by: nbigreeneconomy@gmail.com
✅ Opportunity deleted successfully.
```

### Verification
- [ ] Delete confirmation modal appears
- [ ] "Confirm Delete" button is clickable
- [ ] No error messages appear
- [ ] Success alert shows: "✅ Opportunity deleted successfully."
- [ ] Opportunity disappears from table
- [ ] Console shows: `✅ Opportunity deleted by`

**Result:** ⏳ PASS / ❌ FAIL

---

## Test 8: Verify Delete in Firestore

### Steps
1. In Firebase Console, opportunities collection
2. Look for your test opportunity (title: "Test Opportunity 001 - UPDATED")

### Expected Result
```
Document should NO LONGER EXIST in the collection
```

### Verification
- [ ] Document is not in the opportunities collection
- [ ] Firestore count decreased by 1

**Result:** ⏳ PASS / ❌ FAIL

---

## Test 9: Session Timeout

### Steps
1. On `/ADMIN/ManageOpprtunities.html`, signed in as admin
2. Open DevTools Console (F12)
3. Run this command: `window.AdminSessionManager.logSessionInfo()`
4. Look for line: "Session expires in: X seconds"

### Expected Output
```
👤 Admin Session Info
  📧 Email: nbigreeneconomy@gmail.com
  ✅ Is Admin: true
  ⏱️ Session expires in: 1800 seconds (or similar)
```

### Verification
- [ ] Session info displays in console
- [ ] Shows remaining time (should be ~1800 seconds = 30 minutes)

**Result:** ⏳ PASS / ❌ FAIL

---

## Test 10: Session Check After Page Reload

### Steps
1. On `/ADMIN/ManageOpprtunities.html`, signed in
2. Refresh page: `F5`
3. Open DevTools Console (F12)
4. Wait for page to fully load

### Expected Console Output
```
✅ Found valid admin session: nbigreeneconomy@gmail.com
✨ HAS ADMIN ACCESS: YES ✅
```

### Verification
- [ ] Page loads without redirecting to SignIn
- [ ] Console shows admin session found
- [ ] Table loads opportunities
- [ ] Can still perform operations

**Result:** ⏳ PASS / ❌ FAIL

---

## Test 11: Sign Out and Try to Access

### Steps
1. Navigate away from the application
2. Sign out (or close browser to clear sessionStorage)
3. Navigate to: `/ADMIN/ManageOpprtunities.html`

### Expected Console Output
```
⚠️ NO USER AUTHENTICATED IN FIREBASE! Checking admin session...
⚠️ No valid admin session! Redirecting to sign in...
⏰ [2 second delay]
[Page redirects to SignIn]
```

### Expected Page Behavior
- [ ] Page does NOT load opportunities table
- [ ] Gets redirected to SignIn page
- [ ] Error message: "You must be signed in to manage opportunities"

**Result:** ⏳ PASS / ❌ FAIL

---

## Final Summary

### All Tests Passing?
- [ ] Test 1: Sign In Flow ✅
- [ ] Test 2: Session Persistence ✅
- [ ] Test 3: Create Opportunity ✅
- [ ] Test 4: Firestore Create Verify ✅
- [ ] Test 5: Update Opportunity ✅
- [ ] Test 6: Firestore Update Verify ✅
- [ ] Test 7: Delete Opportunity ✅
- [ ] Test 8: Firestore Delete Verify ✅
- [ ] Test 9: Session Timeout ✅
- [ ] Test 10: Session After Reload ✅
- [ ] Test 11: Sign Out Access ✅

### Overall Result
```
🎉 ALL TESTS PASSED!
✅ Admin session management is working correctly
✅ Can add/edit/delete opportunities
✅ Firestore records admin who performed action
✅ Session persists across page navigation
✅ Session requires login to access
```

OR

```
❌ SOME TESTS FAILED
Review failed tests above and check:
1. Console (F12) for specific errors
2. Firestore rules are published
3. Admin session manager is loaded
4. Browser sessionStorage is enabled
```

---

## Troubleshooting Commands

Run these in DevTools Console (F12) to debug:

### Check Session Status
```javascript
window.AdminSessionManager.logSessionInfo()
```

### Get Session Data
```javascript
const session = window.AdminSessionManager.getAdminSession();
console.log(session);
```

### Check if Admin
```javascript
console.log('Is Admin:', window.AdminSessionManager.isAdminLoggedIn());
```

### Get Admin Email
```javascript
console.log('Admin Email:', window.AdminSessionManager.getAdminEmail());
```

### Refresh Session
```javascript
window.AdminSessionManager.refreshAdminSession()
```

### Clear Session (Logout)
```javascript
window.AdminSessionManager.clearAdminSession()
```

---

## Notes

- Tests should be run in order (1 through 11)
- Each test builds on previous tests
- If a test fails, don't continue until it's fixed
- Check console (F12) for detailed error messages
- All timestamps will vary based on when tests are run
- Document IDs in Firestore will be auto-generated

Good luck testing! 🚀
