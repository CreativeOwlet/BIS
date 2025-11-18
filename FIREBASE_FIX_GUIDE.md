# Firebase 404 Error Fix Guide

## Problem
When trying to register, you received the error:
```
404. That's an error.
The requested URL /v1/accounts:signUp?key=AIzaSyBOkYlLD4JUC7d_ylBNI9rScriTk2Tqv9A was not found on this server
```

## Root Cause
The Firebase SDK was not properly initialized when the Angular application started, causing it to fall back to the REST API which doesn't work correctly in this context.

## Solution Applied

### 1. Updated `app.config.ts`
Added Firebase initialization to the application config so the SDK initializes when the app boots:

```typescript
// Import Firebase to ensure it's initialized
import { app as firebaseApp } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    {
      provide: 'FIREBASE_APP',
      useValue: firebaseApp
    }
  ]
};
```

### 2. Enhanced `auth.service.ts`
Added proper Firebase persistence configuration:

```typescript
constructor() {
  // Enable persistence
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => console.error('Persistence error:', error));
  
  this.initializeAuthStateListener();
}
```

### 3. Improved `signup.component.ts`
Added detailed error handling and input validation:
- Validates required fields
- Checks password length (minimum 6 characters)
- Maps Firebase error codes to user-friendly messages
- Logs errors to console for debugging

## Testing the Fix

### Step 1: Open the Application
1. Open your browser
2. Navigate to `http://localhost:4200`
3. You should see the login page

### Step 2: Create a Test Account
1. Click "Sign up" or navigate to signup
2. Fill in the form:
   - **Name**: John Doe
   - **Email**: test@example.com
   - **Password**: Test123456
   - **Confirm Password**: Test123456
   - **User Type**: Resident

### Step 3: Check the Console
1. Press `F12` to open Developer Tools
2. Go to the "Console" tab
3. Look for the message:
   ```
   Attempting to sign up resident with email: test@example.com
   ```
4. If successful, you should see:
   ```
   Sign up successful
   ```

### Step 4: Verify in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `bis-database-b5e86`
3. Go to **Authentication** > **Users**
4. You should see your new user listed

## Common Issues & Solutions

### Issue 1: Still Getting 404 Error
**Solution:**
- Hard refresh the page: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Check that the dev server is running: `npm start`
- Look at the console for any other errors

### Issue 2: "Email already in use"
**Cause:** The email was already registered
**Solution:** Try a different email address or check Firebase Console to see registered users

### Issue 3: "Invalid email address"
**Cause:** Email format is incorrect
**Solution:** Use a proper email format like `user@example.com`

### Issue 4: "Password is too weak"
**Cause:** Password doesn't meet Firebase requirements (minimum 6 characters)
**Solution:** Use a password with at least 6 characters

### Issue 5: CORS Error or Network Error
**Cause:** Firebase credentials might be incorrect
**Solution:**
1. Verify credentials in `src/environments/environment.ts`
2. Check that Firebase project ID matches: `bis-database-b5e86`
3. Verify API key: `AIzaSyBOkYlLD4JUC7d_ylBNI9rScriTk2Tqv9A`

## Debugging Steps

### 1. Check Browser Console
Press `F12` and go to **Console** tab. Look for:
- Any red error messages
- Firebase initialization messages
- Network errors (Network tab)

### 2. Check Application State
In DevTools > **Application** > **Local Storage**, verify Firebase data is stored:
- `firebase:authUser:...` entries should exist
- This means the SDK properly initialized

### 3. Test Network Requests
Go to **Network** tab and look for:
- ❌ `/v1/accounts:signUp` (this was the problem - should NOT appear)
- ✅ No network calls or modern SDK calls (should use SDK methods)

## Next Steps After Successful Registration

1. **Login**: Use your registered email and password to login
2. **Complete Resident Profile**: Update your information
3. **Request Document**: Submit your first document request
4. **Check Status**: Track your request status

## Still Having Issues?

1. **Check the Console Output**: The improved signup component now logs detailed messages
2. **Verify Firebase Credentials**: Double-check all values in `environment.ts`
3. **Rebuild the Project**: Run `npm run build` to ensure all changes compiled
4. **Clear Cache**: Clear browser cache and local storage
5. **Check Firebase Console**: Ensure your project is properly configured

## Files Modified

- `src/app/app.config.ts` - Added Firebase initialization
- `src/app/services/auth.service.ts` - Added persistence and better initialization
- `src/app/components/signup/signup.component.ts` - Added error handling and validation

## Technical Details

### Why This Happens
Firebase SDK has two ways to authenticate:
1. **SDK Method** (preferred): Direct JavaScript calls - what we use
2. **REST API** (fallback): HTTP calls to `/v1/accounts:signUp` - what was happening

The SDK fell back to REST API because it wasn't properly initialized before components tried to use it.

### Why the Fix Works
By importing Firebase in `app.config.ts`, we ensure:
1. Firebase initializes BEFORE any components load
2. The Auth service has a valid initialized instance
3. The SDK can use proper authentication methods
4. No fallback to REST API is needed

## References
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup)
- [Angular Firebase Integration](https://angular.io/guide/security)
