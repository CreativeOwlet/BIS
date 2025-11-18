# Firebase Setup Checklist

## ⚠️ Before You Continue

You need to complete these Firebase Console configurations FIRST before registration will work.

## Step 1: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **bis-database-b5e86**
3. In the left menu, go to **Build** > **Authentication**
4. Click **"Get Started"** or **"Create sign-in method"**
5. Select **Email/Password**
6. Toggle **"Enable"** to ON
7. Keep "Password account creation" ENABLED
8. Click **"Save"**

✅ **Expected Result**: Authentication should show "Email/Password" as enabled

## Step 2: Enable Firestore Database (for future features)

1. In Firebase Console, go to **Build** > **Firestore Database**
2. Click **"Create database"**
3. Choose location (closest to you)
4. Start in **"Production mode"** OR **"Test mode"** (we'll fix rules later)
5. Click **"Create"**

✅ **Expected Result**: Database should be ready

## Step 3: Configure Firestore Security Rules

⚠️ **IMPORTANT**: Without proper rules, database operations will fail!

1. In Firestore Database, go to **"Rules"** tab
2. Replace ALL the text with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own user data
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Residents collection - staff can CRUD, residents can read own
    match /residents/{document=**} {
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff';
      allow read: if request.auth != null;
    }
    
    // Document requests - authenticated users can create/read
    match /document_requests/{document=**} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (resource.data.residentId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff');
      allow update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff';
    }
    
    // Announcements - all authenticated users can read, staff can write
    match /announcements/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff';
    }
    
    // Temporary: Allow all for testing (⚠️ REMOVE IN PRODUCTION)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

✅ **Expected Result**: Rules should update without errors

## Step 4: Verify Your API Key Has Correct Permissions

1. Go to **Settings** > **Project settings** (gear icon, top left)
2. Go to **"Service accounts"** tab
3. Verify your project ID is: `bis-database-b5e86`
4. Go to **"General"** tab and verify:
   - **Project ID**: bis-database-b5e86
   - **API keys** section shows your API key

✅ **Expected Result**: Credentials match your `environment.ts`

## Step 5: Update Auth Service to Create User Document

After Firebase Authentication is enabled, update your auth service to also create a user document in Firestore. 

Create a new user record in Firestore when they sign up:

```typescript
// In auth.service.ts - add this import
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../../environments/environment';

// Update signUpResident method
async signUpResident(email: string, password: string, name: string): Promise<any> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update profile
  await updateProfile(result.user, { displayName: name });
  
  // Create user document in Firestore
  await setDoc(doc(db, 'users', result.user.uid), {
    email: email,
    name: name,
    role: 'resident',
    createdAt: new Date(),
    uid: result.user.uid
  });
  
  return result;
}

// Update signUpStaff method
async signUpStaff(email: string, password: string, name: string): Promise<any> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update profile
  await updateProfile(result.user, { displayName: name });
  
  // Create user document in Firestore
  await setDoc(doc(db, 'users', result.user.uid), {
    email: email,
    name: name,
    role: 'staff',
    createdAt: new Date(),
    uid: result.user.uid
  });
  
  return result;
}
```

## Troubleshooting

### Error: "Missing or insufficient permissions"
**Cause**: Firestore rules don't allow the operation
**Solution**: Check that rules are published and match above

### Error: "Authentication provider not enabled"
**Cause**: Email/Password authentication not enabled in Firebase Console
**Solution**: Complete Step 1 above

### Error: "Project not found"
**Cause**: Wrong project ID or Firebase not initialized
**Solution**: Verify project ID is `bis-database-b5e86` in Firebase Console

### Still not working?
1. **Clear browser cache**: Ctrl + Shift + Delete
2. **Check console**: F12 > Console tab for actual error message
3. **Look at Network tab**: See what API calls are being made and what errors come back

## Testing Registration After Setup

1. Complete all steps above
2. Go to http://localhost:4200
3. Click Sign Up
4. Fill in form with:
   - **Name**: Test User
   - **Email**: test@example.com (use different email each time or delete previous user)
   - **Password**: Test123456
5. Click **Sign Up**
6. Check console (F12) for success message
7. Verify in Firebase Console > Authentication > Users (you should see the new user)

## Quick Reference: What's What

| Component | Purpose | Location |
|-----------|---------|----------|
| **Firebase Auth** | User login/registration | Build > Authentication |
| **Firestore** | Store user data, residents, requests | Build > Firestore Database |
| **Security Rules** | Control who can read/write data | Firestore Database > Rules |
| **Service Accounts** | Verify project credentials | Settings > Service Accounts |

