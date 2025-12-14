# Admin Session - Debugging Checklist

Use this guide if you're still experiencing permission issues after the fix.

---

## Level 1: Browser Console Checks

### 1.1 Check if AdminSessionManager is loaded
```javascript
console.log(window.AdminSessionManager);
```
**Expected**: Logs an object with methods like `initializeAdminSession`, `getAdminSession`, etc.

**If undefined**: 
- The script `/scripts/adminSessionManager.js` failed to load
- Check Network tab in DevTools for failed requests
- Verify file exists at `c:\Users\user\Pictures\nbigreeneconomyvercel\scripts\adminSessionManager.js`

---

### 1.2 Check current admin session
```javascript
window.AdminSessionManager.logSessionInfo();
```

**Expected Output**:
```
👤 Admin Session Info
📧 Email: nbigreeneconomy@gmail.com
🆔 UID: mjuoJoi3W0Yoe6q4fjJO9dbKym12
👤 Name: nbigreeneconomy@gmail.com
✅ Is Admin: true
✔️ Email Verified: false
⏱️ Session expires in: 1800 seconds
```

**If showing "Is Admin: false"**:
- Problem: Email not recognized as admin
- Check if email exactly matches: `nbigreeneconomy@gmail.com`
- The hardcoded admin list in `adminSessionManager.js` line 6: `const ADMIN_EMAILS = ['nbigreeneconomy@gmail.com'];`

**If showing "Email: null"**:
- Problem: Session was initialized with null user
- This is the race condition bug (should be fixed now)
- Try: Clear sessionStorage and re-login
  ```javascript
  sessionStorage.clear();
  window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
  ```

---

### 1.3 Check Firebase auth state
```javascript
console.log(window.firebaseModules.auth.currentUser);
```

**Expected**: Object like:
```javascript
{
  uid: "mjuoJoi3W0Yoe6q4fjJO9dbKym12",
  email: "nbigreeneconomy@gmail.com",
  emailVerified: false,
  // ... other fields
}
```

**If null**:
- Problem: You're not actually signed in to Firebase
- This means Firebase didn't restore your persisted login
- Try: Sign in again
  ```javascript
  window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
  ```

**If different email**:
- Problem: You're signed in as wrong user
- Sign out and sign back in as correct admin
  ```javascript
  window.firebaseModules.auth.signOut();
  window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
  ```

---

### 1.4 Check sessionStorage contents
```javascript
console.log(JSON.parse(sessionStorage.getItem('nbi_admin_session')));
```

**Expected**: JSON object with:
- `email: "nbigreeneconomy@gmail.com"`
- `isAdmin: true`
- `uid: "mjuoJoi3W0Yoe6q4fjJO9dbKym12"`
- `expiresAt: [timestamp in future]`

**If null**:
- Problem: No admin session stored
- This happens if you never signed in or session expired
- Sign in again

**If email is null or isAdmin is false**:
- Problem: Session was corrupted
- Clear and restart:
  ```javascript
  sessionStorage.removeItem('nbi_admin_session');
  window.location.reload();
  window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
  ```

---

### 1.5 Check session expiration
```javascript
const session = JSON.parse(sessionStorage.getItem('nbi_admin_session'));
console.log('Expires in:', new Date(session.expiresAt - Date.now()).toISOString());
console.log('Expired:', Date.now() > session.expiresAt);
```

**Expected**: 
- Expires in: ~30 minutes (1800 seconds)
- Expired: false

**If Expired: true**:
- Problem: Session timeout exceeded
- Re-login to get fresh session
  ```javascript
  window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
  ```

---

## Level 2: Network Checks

### 2.1 Verify scripts are loading
1. Open **DevTools** → **Network** tab
2. Look for `/scripts/adminSessionManager.js` 
3. Check status is **200** (green), not 404 or 500

**If 404**:
- File doesn't exist or wrong path
- Check file: `c:\Users\user\Pictures\nbigreeneconomyvercel\scripts\adminSessionManager.js`
- Check path in HTML: `<script src="/scripts/adminSessionManager.js"></script>` (should have leading `/`)

**If 500**:
- Server error
- Restart web server
- Check server logs for errors

---

### 2.2 Check Firebase initialization
In ManageOpprtunities.html console, look for:
```
✅ Firebase (v10.12.4 Modular) initialized successfully
```

**If not present**:
- Firebase didn't initialize properly
- Check if Firebase config is correct (in `ADMIN/ManageOpprtunities.html` line ~615)
- Check for errors in console: Look for red ❌ messages
- Try: Hard refresh `Ctrl+Shift+R`

---

## Level 3: Authentication Flow Checks

### 3.1 Test Sign-In Flow

**Step 1**: Go to `/LandingPage/SignInAndSignUp/SignIn.html`

**Step 2**: Enter `nbigreeneconomy@gmail.com` and submit

**Step 3**: Check console immediately (before redirecting)
```
✅ Admin session stored: nbigreeneconomy@gmail.com
```

**If missing**:
- Check: Is `signin_clean.js` calling `AdminSessionManager.initializeAdminSession(user)`?
- Line should be around line 155 in `signin_clean.js`

**Step 4**: Go through verification flow

**Step 5**: Should redirect to Dashboard

**Step 6**: Check console shows:
```
📧 Email: nbigreeneconomy@gmail.com
✅ Is Admin: true
```

**If showing "Is Admin: false"**:
- Email not matching hardcoded admin list
- Verify exactly: `nbigreeneconomy@gmail.com` (no extra spaces)

---

### 3.2 Test Navigation Flow

**Step 1**: Sign in successfully (see Level 3.1)

**Step 2**: Verify session in Dashboard console:
```javascript
window.AdminSessionManager.logSessionInfo();
// Should show Is Admin: true
```

**Step 3**: Navigate to ManageOpprtunities (click link or direct URL)

**Step 4**: Check ManageOpprtunities console:
```
✅ Found valid admin session in storage: nbigreeneconomy@gmail.com
📋 Page initialized with admin: nbigreeneconomy@gmail.com
```

**If showing redirect error**:
- Session was not found or expired
- Check: Did you navigate to ManageOpprtunities too slowly?
- Session expires after 30 minutes
- Re-login if needed

---

### 3.3 Test CRUD Operations

#### Add Opportunity
1. Click "Add Opportunity" button
2. Should open modal (not show error)
3. Fill in fields and submit
4. Should show success (no "permission denied" error)

**If error appears**:
```javascript
// Check before submitting:
window.AdminSessionManager.getAdminSession()
// Should have isAdmin: true
```

#### Edit Opportunity
1. Click edit icon on any opportunity
2. Should open modal (not redirect)
3. Edit and submit
4. Should update successfully

**If error appears**:
- Same check as Add above

#### Delete Opportunity
1. Click delete icon on any opportunity
2. Should open confirmation modal
3. Confirm deletion
4. Should delete successfully

**If error appears**:
- Same check as Add above

---

## Level 4: Firestore Rules Checks

### 4.1 Check if createdBy/updatedBy fields are set
1. In ManageOpprtunities, add a test opportunity
2. Go to **Firebase Console** → **Firestore** → **opportunities** collection
3. Click on the new record
4. Should see:
   - `createdBy: "nbigreeneconomy@gmail.com"`
   - `updatedAt: [timestamp]`

**If missing**:
- Check ManageOpprtunities.html line ~915 has:
  ```javascript
  opportunityData.createdBy = adminSession.email;
  opportunityData.updatedAt = serverTimestamp();
  ```

**If still missing**:
- Check Firestore rules allow these fields
- Rules should match: `FIRESTORE_RULES_UPDATED.txt`

---

### 4.2 Check Firestore Rules are correct
1. Go to **Firebase Console** → **Firestore** → **Rules** tab
2. Verify section for opportunities:
   ```
   match /opportunities/{opportunityId} {
     allow read: if true;
     allow create: if isAdmin() && request.resource.data.keys().hasOnly([...]);
     allow update: if isAdmin() && request.resource.data.keys().hasOnly([...]);
     allow delete: if isAdmin();
   }
   ```

**If different**:
- Update to match `FIRESTORE_RULES_UPDATED.txt`
- Click **Publish**
- Wait for confirmation

**If operation still fails after fixing rules**:
- Wait a few seconds (Firestore rules take time to apply)
- Try operation again

---

## Level 5: Permission Denied in Firestore

If you're getting "Permission denied" errors from Firestore operations:

### 5.1 Check isAdmin() function in Firestore rules
```javascript
function isAdmin() {
  return request.auth != null && (
    request.auth.token.email == 'nbigreeneconomy@gmail.com' ||
    exists(/databases/$(database)/documents/admins/$(request.auth.token.email))
  );
}
```

**Issue**: Email doesn't match exactly

**Fix**: Make sure your email is exactly `nbigreeneconomy@gmail.com` with no typos

### 5.2 Check if you're actually authenticated
```javascript
console.log(window.firebaseModules.auth.currentUser?.email);
```

**If null**:
- Not signed in to Firebase
- Re-sign in

**If wrong email**:
- Signed in as different user
- Sign out and sign in as correct admin

### 5.3 Check if admins collection exists
1. Go to Firebase Console → Firestore
2. Check if collection `/admins/` exists
3. If not, might need to create it:
   - Click "+" to add collection
   - Name: `admins`
   - Document ID: `nbigreeneconomy@gmail.com`
   - Field: `isAdmin` (boolean) = `true`

---

## Level 6: Complete Reset

If nothing above works, do a complete reset:

### 6.1 Clear All Storage
```javascript
// In browser console:
sessionStorage.clear();
localStorage.clear();
// Go to Storage tab in DevTools and delete all

// Then sign out:
await window.firebaseModules.auth.signOut();
```

### 6.2 Hard Refresh Browser
- Windows/Linux: `Ctrl+Shift+R`
- Mac: `Cmd+Shift+R`

### 6.3 Close and Reopen Browser Tab
- Completely close the tab
- Open new tab
- Navigate to app fresh

### 6.4 Re-login
- Go to Sign In page
- Sign in as `nbigreeneconomy@gmail.com`
- Complete verification
- Test ManageOpprtunities again

---

## Quick Troubleshooting Flowchart

```
Does console show "Is Admin: true"?
  ├─ YES ✅
  │  └─ Can you see "Add Opportunity" button?
  │     ├─ YES ✅ → Try to add/edit/delete
  │     │         Success? → ✅ Done!
  │     │         Error? → Check Firestore rules (Level 4)
  │     └─ NO ❌ → Page didn't load properly, try hard refresh
  │
  └─ NO ❌
     ├─ Does it show "Is Admin: false"?
     │  └─ Check: Is your email "nbigreeneconomy@gmail.com"?
     │     ├─ YES ✅ → Email matches but not recognized as admin
     │     │          Check adminSessionManager.js line 6
     │     └─ NO ❌ → Sign in with correct email
     │
     ├─ Does it show "Email: null"?
     │  └─ Session corrupted (race condition)
     │     → Clear sessionStorage and re-login (Level 3.1)
     │
     └─ Does AdminSessionManager.logSessionInfo() error?
        └─ Script not loaded (Level 2.1)
           → Check Network tab for /scripts/adminSessionManager.js
```

---

## Quick Test Commands

Copy-paste these into browser console on ManageOpprtunities page:

### Test 1: Check if admin
```javascript
window.AdminSessionManager.logSessionInfo();
```

### Test 2: Check Firebase auth
```javascript
console.log('Firebase user:', window.firebaseModules.auth.currentUser?.email);
```

### Test 3: Check if can add opportunity (simulated)
```javascript
const session = window.AdminSessionManager.getAdminSession();
console.log('Can add?', session && session.isAdmin ? 'YES ✅' : 'NO ❌');
```

### Test 4: Get session expiration time
```javascript
const session = JSON.parse(sessionStorage.getItem('nbi_admin_session'));
const remaining = Math.floor((session.expiresAt - Date.now()) / 1000 / 60);
console.log(`Session expires in: ${remaining} minutes`);
```

### Test 5: Force re-login
```javascript
sessionStorage.clear();
window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
```

---

## Support

If you're still stuck:

1. **Run all Level 1 checks** and note any errors
2. **Run all Level 2 checks** and check for network issues
3. **Check the console log** and look for red ❌ errors
4. **Screenshot the error** and full console output
5. **Check files were modified**:
   - `scripts/adminSessionManager.js` - should have "checking for existing session" on line ~21
   - `ADMIN/ManageOpprtunities.html` - should have `authProcessed` flag on line ~631

The fix addresses the Firebase race condition which was the main issue. These debugging steps should help identify if something else is wrong.
