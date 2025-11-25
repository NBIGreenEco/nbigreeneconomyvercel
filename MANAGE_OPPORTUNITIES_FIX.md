## Manage Opportunities - Fix Guide

### Issues Found & Fixed:

1. **Firebase Script Loading Issue**
   - Problem: Firebase auth-compat.js was missing but required for compat mode
   - Fixed: Added firebase-auth-compat.js to the script tags

2. **Firestore Security Rules**
   - Problem: The `isAdmin()` function wasn't properly checking admin status
   - Fixed: Updated the function to check for the specific admin email OR admin document existence

3. **Error Messages**
   - Problem: Generic error messages didn't help identify permission issues
   - Fixed: Added detailed error logging for permission-denied and authentication errors

### Steps to Apply the Fix:

#### Step 1: Update Firestore Security Rules
Go to Firebase Console → Firestore → Rules and replace your current rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email == 'nbigreeneconomy@gmail.com' ||
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email))
      );
    }

    match /opportunities/{opportunityId} {
      allow read: if true;
      allow create: if isAdmin() && request.resource.data.keys().hasOnly(['name', 'category', 'description', 'link', 'linkText', 'createdAt', 'updatedAt']);
      allow update: if isAdmin() && request.resource.data.keys().hasOnly(['name', 'category', 'description', 'link', 'linkText', 'createdAt', 'updatedAt']);
      allow delete: if isAdmin();
    }

    [... rest of rules remain the same ...]
  }
}
```

Key changes:
- Enhanced `isAdmin()` function to check both the hardcoded admin email AND the admins collection
- Added specific field validation for opportunities create/update operations
- Separated create and update rules from delete

#### Step 2: Verify Admin Status in Firestore
1. Go to Firebase Console → Firestore Database
2. Check the `/admins/` collection
3. Make sure you have a document with your admin email as the ID
4. The document should have: `{ isAdmin: true }`

If not, create it:
- Collection: `admins`
- Document ID: `nbigreeneconomy@gmail.com` (or your admin email)
- Field: `isAdmin` (boolean) = `true`

#### Step 3: Test the Fix
1. Sign in as admin
2. Go to Manage Opportunities
3. Try to:
   - Add a new opportunity
   - Edit an existing opportunity
   - Delete an opportunity

#### Step 4: If Still Not Working
Check the browser console (F12 → Console tab) for errors like:
- "permission-denied" = Not in admins collection
- "unauthenticated" = Not properly signed in
- Other errors = Check the detailed error messages

### Troubleshooting:

**Error: "Permission denied"**
- Verify the admin email exists in `/admins/` collection
- Verify the user is signed in with that email
- Check that the document has `isAdmin: true` field

**Error: "Unauthenticated"**
- Sign out and sign back in
- Clear browser cache
- Try a different browser
- Check that localStorage/sessionStorage isn't corrupted

**Operations still not working**
- Open browser console (F12)
- Check for detailed error messages
- Look for the specific error code and description
- Screenshot the error and share for further assistance

### Files Modified:
- `/ADMIN/ManageOpprtunities.html` - Fixed Firebase initialization and error handling
- `/FIRESTORE_RULES_FIXED.txt` - Corrected security rules (apply these to Firebase)
