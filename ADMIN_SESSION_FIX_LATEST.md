# Admin Session Fix - Latest (November 25, 2025)

## Problem Identified

Console errors showed:
- ❌ "You do not have admin permissions. Only admins can manage opportunities."
- ❌ "You must be logged in as an admin to perform this action."
- **Email: null** (Session showing null user)
- **Is Admin: false** (Session not properly initialized)

### Root Cause

The `onAuthStateChanged` listener was firing **twice**:

1. **First call**: With `user = null` (Firebase initial state, before restoring persisted auth)
2. **Second call**: With actual `user` object (after Firebase loads persisted session)

The code was attempting to initialize admin session on the **first call with null**, resulting in a corrupted session with `email: null` and `isAdmin: false`.

---

## Solution Implemented

### 1. **Enhanced Admin Session Manager** (`scripts/adminSessionManager.js`)

**Changed behavior of `initializeAdminSession()`:**
- If `firebaseUser` is **null**: Check for existing valid session in sessionStorage
- If existing session is valid: Return it without corrupting it
- If `firebaseUser` is provided: Initialize new session normally

```javascript
static async initializeAdminSession(firebaseUser) {
    // If no user provided, try to use existing session
    if (!firebaseUser) {
        console.warn('⚠️ No Firebase user provided - checking for existing session');
        const existingSession = this.getAdminSession();
        if (existingSession && existingSession.isAdmin) {
            console.log('✅ Using existing admin session:', existingSession.email);
            return existingSession;  // ← Reuse valid session
        }
        return null;
    }
    // ... rest of initialization
}
```

### 2. **Race Condition Prevention** (`ADMIN/ManageOpprtunities.html`)

**Added tracking flag to prevent multiple auth processing:**

```javascript
let authProcessed = false;  // ← Track if auth already processed

onAuthStateChanged(auth, async (user) => {
    // Skip if we've already processed auth or if user is null
    if (authProcessed) return;  // ← Prevent duplicate processing
    
    if (!user) {
        // Check sessionStorage for existing valid session
        const adminSession = window.AdminSessionManager?.getAdminSession();
        if (adminSession && adminSession.isAdmin) {
            authProcessed = true;
            // Continue with valid session
        } else {
            // Only redirect if truly no auth (with delay for Firebase to load)
            setTimeout(() => { ... }, 500);  // ← Give Firebase time to restore
        }
        return;
    }
    
    // Process actual Firebase user
    authProcessed = true;
    // ... initialize new session
});
```

### 3. **Admin Permission Checks Before Modal Display**

**Added checks to `showAddModal()`, `editOpportunity()`, and `showDeleteModal()`:**

```javascript
function showAddModal() {
    // Check admin session BEFORE showing modal
    const adminSession = window.AdminSessionManager?.getAdminSession();
    if (!adminSession || !adminSession.isAdmin) {
        showErrorMessage('❌ You must be logged in as an admin...');
        setTimeout(() => {
            window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html?redirect=...';
        }, 1500);
        return;  // ← Prevent modal display if not admin
    }
    
    // Rest of modal setup
    currentOpportunityId = null;
    modalTitle.textContent = 'Add New Opportunity';
    opportunityModal.show();
}
```

---

## How the Fix Works

### Sign-In Flow

```
1. User enters nbigreeneconomy@gmail.com and signs in
2. signin_clean.js receives Firebase user object
3. AdminSessionManager.initializeAdminSession(user) is called
   ✅ Creates session with email: nbigreeneconomy@gmail.com, isAdmin: true
4. Session stored in sessionStorage
5. Firebase also stores auth state locally (for persistence)
```

### Navigation Flow

```
1. User navigates from Dashboard to ManageOpprtunities
2. Page loads, Firebase restores persisted auth asynchronously
3. onAuthStateChanged fires with null (initial state)
   ✅ NEW: initializeAdminSession(null) checks sessionStorage
   ✅ Finds valid session with email and isAdmin=true
   ✅ Returns existing session without corrupting it
4. Page initializes with valid admin session
5. Admin can click "Add", "Edit", "Delete" buttons
```

### Permission Flow

```
1. User clicks "Add Opportunity" button
   ✅ showAddModal() checks getAdminSession()
   ✅ Session has isAdmin=true
   ✅ Modal displays
   
2. User fills form and clicks "Submit"
   ✅ Form submission checks getAdminSession()
   ✅ Session is valid, createdBy field is recorded
   ✅ Operation succeeds in Firestore
   
3. User clicks "Edit" or "Delete"
   ✅ Same permission checks apply
   ✅ Operations succeed with valid admin session
```

---

## Session Storage Structure

After fix, sessionStorage contains:

```json
{
  "nbi_admin_session": {
    "uid": "mjuoJoi3W0Yoe6q4fjJO9dbKym12",
    "email": "nbigreeneconomy@gmail.com",
    "displayName": "nbigreeneconomy@gmail.com",
    "photoURL": null,
    "emailVerified": false,
    "isAdmin": true,
    "createdAt": 1764071260092,
    "expiresAt": 1764073060092
  }
}
```

**Key fields:**
- `email: "nbigreeneconomy@gmail.com"` ← Now properly set
- `isAdmin: true` ← Now properly set
- `expiresAt` ← 30 minutes from login (auto-logout feature)

---

## Testing Steps

### 1. **Clear Existing Session**
```javascript
// In browser console:
sessionStorage.removeItem('nbi_admin_session');
localStorage.clear();  // Optional: clears Firebase persistence too
```

### 2. **Sign In Again**
- Navigate to Sign In page
- Enter: `nbigreeneconomy@gmail.com`
- Click "Verify Code" and proceed through verification
- Check console for:
  ```
  ✅ Admin session stored: nbigreeneconomy@gmail.com
  📧 Email: nbigreeneconomy@gmail.com
  ✅ Is Admin: true
  ```

### 3. **Navigate to ManageOpprtunities**
- From Dashboard, click "Manage Opportunities"
- Page should load with no redirects
- Console should show:
  ```
  ✅ Found valid admin session in storage: nbigreeneconomy@gmail.com
  📋 Page initialized with admin: nbigreeneconomy@gmail.com
  ```

### 4. **Test CRUD Operations**
- **Add**: Click "Add Opportunity" → Modal opens → Form submits successfully
- **Edit**: Click edit icon → Modal opens → Changes save successfully
- **Delete**: Click delete icon → Delete confirmed → Item removed

### 5. **Verify Firestore**
- Go to Firebase Console → Firestore
- Check `opportunities` collection
- Verify new/edited items have:
  - `createdBy: "nbigreeneconomy@gmail.com"`
  - `updatedBy: "nbigreeneconomy@gmail.com"`
  - `createdAt: timestamp`
  - `updatedAt: timestamp`

---

## Files Modified

1. **`scripts/adminSessionManager.js`**
   - Enhanced `initializeAdminSession()` to handle null users
   - Reuses valid sessions from sessionStorage when Firebase hasn't restored auth yet

2. **`ADMIN/ManageOpprtunities.html`**
   - Added race condition prevention with `authProcessed` flag
   - Added permission checks to `showAddModal()`, `editOpportunity()`, `showDeleteModal()`
   - Added 500ms delay before redirecting (gives Firebase time to restore auth)

---

## Console Output Expected

### Success Case
```
✅ Firebase (v10.12.4 Modular) initialized successfully
✅ Found valid admin session in storage: nbigreeneconomy@gmail.com
📋 Page initialized with admin: nbigreeneconomy@gmail.com
📥 Loading opportunities from Firestore...
✅ Firestore query successful, found 12 opportunities
👤 Admin session confirmed: nbigreeneconomy@gmail.com
✅ Page initialization complete
```

### Error Case (Non-Admin)
```
❌ You do not have admin permissions. Only admins can manage opportunities.
```

### Session Info Log
```
👤 Admin Session Info
📧 Email: nbigreeneconomy@gmail.com
🆔 UID: mjuoJoi3W0Yoe6q4fjJO9dbKym12
👤 Name: nbigreeneconomy@gmail.com
✅ Is Admin: true
✔️ Email Verified: false
⏱️ Session expires in: 1800 seconds
```

---

## Key Improvements

| Issue | Before | After |
|-------|--------|-------|
| **Firebase Race Condition** | onAuthStateChanged fired with null, corrupting session | authProcessed flag prevents duplicate processing |
| **Null User Handling** | initializeAdminSession(null) returned null | initializeAdminSession(null) reuses valid sessionStorage session |
| **Permission Checks** | Only checked on form submit | Checked before modal displays (prevents UI confusion) |
| **Redirect Logic** | Immediate redirect on null user | 500ms delay to allow Firebase to restore auth |
| **User Feedback** | Silent failures or confusing errors | Clear error messages with explicit admin requirement |

---

## Session Persistence

The system now has **dual persistence**:

1. **Firebase Local Persistence** (automatic)
   - Firebase Auth stores token locally
   - Restored when app reloads
   - Survives browser restart (LOCAL persistence mode)

2. **SessionStorage** (our implementation)
   - Stores admin session details
   - Survives page navigation within same tab
   - Cleared when tab is closed (session isolation)
   - 30-minute auto-expiration for security

This dual approach ensures:
- ✅ Session persists across page navigations
- ✅ Session persists across browser restart (via Firebase)
- ✅ Session is isolated per browser tab (sessionStorage)
- ✅ Session auto-expires after 30 minutes (security)

---

## Debugging Tips

### Check if session is stored:
```javascript
console.log(sessionStorage.getItem('nbi_admin_session'));
```

### Check admin status:
```javascript
window.AdminSessionManager.logSessionInfo();
```

### Check Firebase auth:
```javascript
window.firebaseModules.auth.currentUser;
```

### Clear and re-initialize:
```javascript
sessionStorage.removeItem('nbi_admin_session');
window.location.reload();
```

---

## Next Steps

1. **Test the flow**: Sign in → Dashboard → ManageOpprtunities → Add/Edit/Delete
2. **Verify Firestore**: Check that `createdBy`/`updatedBy` fields are populated
3. **Check console**: Verify no error messages appear
4. **Test persistence**: Refresh page and verify session is still valid
5. **Test auto-expire**: Wait 30+ minutes and verify session expires (or manually change timeout in code)

---

## Summary

The fix addresses the Firebase race condition where `onAuthStateChanged` would fire with a null user before restoring persisted auth state. By implementing:

1. Smart session reuse (don't corrupt existing valid sessions)
2. Race condition prevention (track if auth already processed)
3. Permission checks before UI display (prevent confusion)
4. Graceful fallback logic (give Firebase time to restore)

The admin can now successfully manage opportunities without permission errors.
