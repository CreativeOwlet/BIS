# 🔥 Firebase Configuration Guide

## For GitHub Pages Deployment

The `environment.prod.ts` file is used for GitHub Pages deployment. To configure your Firebase credentials:

### Option 1: Direct Update (Simpler)

1. Open `src/environments/environment.prod.ts`
2. Replace the placeholder values with your actual Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyD...", // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

3. Commit and push:
```bash
git add src/environments/environment.prod.ts
git commit -m "Update Firebase credentials"
git push
```

The site will rebuild automatically with your credentials.

### Option 2: Local Development

For local development, copy the template:

```bash
cp src/environments/environment.prod.ts src/environments/environment.ts
```

Then update `environment.ts` with your development Firebase credentials.

**Note**: `environment.ts` is in `.gitignore` and won't be committed.

## 📍 Where to Find Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on Project Settings (⚙️ icon)
4. Scroll down to "Your apps" section
5. Click on the web app (</> icon)
6. Copy the firebaseConfig object values

## ⚠️ Security Note

Since this is a client-side application, Firebase credentials will be visible in the deployed code. This is normal and expected. 

**Protect your Firebase project by**:
- Configuring Firebase Security Rules
- Restricting API key usage in Google Cloud Console
- Setting up proper authentication rules in Firestore

## 🔒 Firebase Security Rules

Make sure to set up proper security rules in Firebase Console:

### Firestore Rules Example:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access only to authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Authentication Rules:
- Enable Email/Password authentication
- Set up proper user roles (staff vs resident)
- Implement proper authorization checks
