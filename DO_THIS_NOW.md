# ⏰ DO THIS NOW - Registration Fix (5 Minutes)

## Your Problem
Registration doesn't work. Error: `404 /v1/accounts:signUp`

## The Answer
You need to **enable Firebase services** in your Firebase Console.

Your code is ✅ ready. You just need to unlock the door.

---

## 3 Simple Steps (5 minutes total)

### STEP 1: Enable Authentication (1 minute)

1. Open: https://console.firebase.google.com
2. Click project: `bis-database-b5e86`
3. Left menu → **Build** → **Authentication**
4. Click blue button "Get Started" or "Add sign-in method"
5. Click **Email/Password**
6. Toggle **"Enable"** switch to ON (blue)
7. Click **Save** button
8. Done! ✅

### STEP 2: Create Database (2 minutes)

1. Left menu → **Build** → **Firestore Database**
2. Click **Create database** button
3. Choose your region (closest one)
4. Select **"Start in test mode"**
5. Click **Create database**
6. Wait for it to say "Active" ✅
7. Done! ✅

### STEP 3: Add Security Rules (2 minutes)

1. Still in Firestore Database page
2. Click **"Rules"** tab
3. **Delete ALL text** in the editor
4. Paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /residents/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /document_requests/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /announcements/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Click blue **"Publish"** button
6. Wait for success message
7. Done! ✅

---

## Then Test (2 minutes)

1. Go to: http://localhost:4200
2. Click **"Sign Up"**
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123456
   - Confirm: Test123456
4. Click "Sign Up"
5. Should see: ✅ **"Account created successfully!"**
6. Should redirect to dashboard

---

## Verify It Worked

1. Open Firebase Console
2. Go to **Authentication** → **Users** tab
3. You should see `test@example.com` listed
4. Done! ✅ Registration works!

---

## If It Still Doesn't Work

Check these:

1. **Did you click the blue PUBLISH button?** (Not just editing rules)
2. **Is Email/Password showing "Enabled" in green?**
3. **Does Firestore Database show "Active" status?**
4. **Did you refresh the browser after changes?** (Ctrl+F5)
5. **Check browser console** (F12 > Console tab) for error message

If still stuck, the error message in the console will tell you what's wrong.

---

## That's It!

You've just completed the setup. Your BIS system is now ready to use! 🎉

- Users can register
- Users can login
- Staff can manage residents
- Residents can request documents

Everything is built and waiting for you!

---

**👉 Start with Step 1 now!**
