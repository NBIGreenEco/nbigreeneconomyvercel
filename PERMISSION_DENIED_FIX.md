# Permission Denied Error - Troubleshooting Guide

## Error Message
"Permission denied: You do not have permission to add/edit opportunities. Please ensure you are logged in as an admin."

## Root Cause
The `isAdmin()` function is returning `false` because:
1. Your email is NOT `nbigreeneconomy@gmail.com`, OR
2. Your email is NOT in the `/admins/` collection document

## Step-by-Step Debugging

### Step 1: Check Console for Debug Info
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Look for messages like:

```
✅ Firebase initialized successfully
👤 User authenticated: your-email@gmail.com
📧 User email: your-email@gmail.com
🔑 Email verified: true
🔐 Is hardcoded admin (nbigreeneconomy@gmail.com): ❌ false
🗂️ Exists in /admins/ collection: ❌ false
✨ HAS ADMIN ACCESS: ❌ NO
```

### Step 2: Identify the Problem

**Scenario 1: Both are FALSE**
```
🔐 Is hardcoded admin: ❌ false
🗂️ Exists in /admins/: ❌ false
→ YOU'RE NOT AN ADMIN
```
**Solution:** See "How to Fix" section below

**Scenario 2: Hardcoded is TRUE, but getting permission denied**
```
🔐 Is hardcoded admin: ✅ true
🗂️ Exists in /admins/: ❌ false
✨ HAS ADMIN ACCESS: ✅ YES
→ RULES MIGHT BE WRONG
```
**Solution:** Update rules or check Firestore Rules validation

**Scenario 3: Admin collection is TRUE, but getting permission denied**
```
🔐 Is hardcoded admin: ❌ false
🗂️ Exists in /admins/: ✅ true
✨ HAS ADMIN ACCESS: ✅ YES
→ RULES MIGHT HAVE FIELD VALIDATION ISSUE
```
**Solution:** Use simplified rules without field validation

---

## How to Fix

### Option A: If you're NOT the hardcoded admin email

1. **Sign in with:** `nbigreeneconomy@gmail.com`
2. OR add your email to `/admins/` collection:

**Steps:**
- Go to Firebase Console → Firestore Database
- Find or create collection: `admins`
- Create new document with ID: `your-email@gmail.com`
- Add field: `isAdmin: true` (boolean)

Example:
```
Collection: admins
  Document ID: mbofhenijunior7@gmail.com
    Field: isAdmin (true)
```

### Option B: If you ARE `nbigreeneconomy@gmail.com` but still getting error

The problem might be the field validation in the rules. Use the simplified rules:

**Copy from:** `FIRESTORE_RULES_DEBUG.txt`
**Go to:** Firebase Console → Firestore → Rules
**Steps:**
1. Open the Debug rules file
2. Copy ALL the content
3. Paste into Firebase Rules editor
4. Click **Publish**
5. Try adding an opportunity again

---

## Quick Checklist

- [ ] I checked the F12 console for debug messages
- [ ] I saw "✨ HAS ADMIN ACCESS: ✅ YES" in console
- [ ] My email is either:
  - [ ] `nbigreeneconomy@gmail.com`, OR
  - [ ] In the `/admins/` collection with `isAdmin: true`
- [ ] I'm signed in with the correct email
- [ ] I've tried the simplified Debug rules

---

## Firestore Setup Verification

### What SHOULD be in your Firestore:

**Option 1: Using hardcoded email**
```
No /admins/ collection needed
Just sign in with: nbigreeneconomy@gmail.com
```

**Option 2: Using /admins/ collection**
```
Collection: admins
├── Document: nbigreeneconomy@gmail.com
│   └── isAdmin: true
├── Document: your-email@gmail.com  (if different admin)
│   └── isAdmin: true
└── Document: another-admin@example.com
    └── isAdmin: true
```

### To verify your setup:

1. Firebase Console → Firestore Database
2. Look for `admins` collection
3. If it exists, expand it
4. Do you see your email as a document?
5. If yes, click on it - does it have `isAdmin: true`?

---

## Rules Being Used

**Current Rules (with field validation):**
```
match /opportunities/{opportunityId} {
  allow create: if isAdmin() && request.resource.data.keys().hasOnly([...]);
  allow update: if isAdmin() && request.resource.data.keys().hasOnly([...]);
  allow delete: if isAdmin();
}
```

**Debug Rules (simplified, no field validation):**
```
match /opportunities/{opportunityId} {
  allow create: if isAdmin();
  allow update: if isAdmin();
  allow delete: if isAdmin();
}
```

If it works with Debug rules but not the original, the issue is field validation.

---

## Common Issues & Solutions

### ❌ "Email doesn't match exactly"
- Emails are case-sensitive in Firestore
- Make sure you typed it EXACTLY: `nbigreeneconomy@gmail.com`
- Not: `Nbigreeneconomy@gmail.com` or `nbigreeneconomy@GMAIL.COM`

### ❌ "Admin document exists but still permission denied"
- Check the field name: must be exactly `isAdmin` (lowercase)
- Check the value: must be boolean `true`, not string `"true"`
- The document ID must be the email, not something else

### ❌ "Console shows ✅ YES but still getting error"
- The rules might have field validation issues
- Use the Debug rules to remove field validation
- Or wait 1-2 minutes for Firestore rules to propagate

### ❌ "I don't see the debug messages in console"
- Firebase might not have initialized yet
- Refresh the page and wait 2 seconds
- Then look at console again
- The messages should appear before you try to add an opportunity

---

## Debug Rules Location
Copy from: `FIRESTORE_RULES_DEBUG.txt` in the project root

## Summary

1. **Check Console (F12)** → See if you're admin
2. **If NO** → Add yourself to `/admins/` collection
3. **If YES but error** → Use Debug rules without field validation
4. **Still not working?** → Check email case sensitivity and field names

---

**Last Resort:** If nothing works:
1. Use the simplified Debug rules from `FIRESTORE_RULES_DEBUG.txt`
2. Share the console messages (screenshot F12)
3. Include your email address
4. Include what you see in `/admins/` collection
