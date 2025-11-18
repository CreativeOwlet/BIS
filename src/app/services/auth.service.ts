import { Injectable, OnDestroy } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  User,
  onAuthStateChanged,
  Unsubscribe,
  setPersistence,
  browserLocalPersistence,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { StaffUser, ResidentUser } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  getUserOnceAfterInit(): any {
      throw new Error('Method not implemented.');
  }
  getRoleOnceAfterInit(): any {
      throw new Error('Method not implemented.');
  }
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private currentUserRoleSubject = new BehaviorSubject<string | null>(null);
  currentUserRole$ = this.currentUserRoleSubject.asObservable();
  private initializedSubject = new BehaviorSubject<boolean>(false);
  authInitialized$ = this.initializedSubject.asObservable();
  private unsubscribe: Unsubscribe | null = null;

  constructor() {
    // Enable persistence and only initialize the auth state listener after persistence is set.
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        this.initializeAuthStateListener();
      })
      .catch((error) => {
        console.error('Persistence error:', error);
        // Even if persistence fails, initialize listener so app can proceed.
        this.initializeAuthStateListener();
      });
  }

  private initializeAuthStateListener(): void {
    this.unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? user.email : 'No user');
      this.currentUserSubject.next(user);
      
      // If user exists, fetch their role from Firestore
      if (user) {
        try {
          // Prefer users collection (staff/admin). If not present, check residents collection.
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data()['role'];
            console.log('User role (from users):', role);
            this.currentUserRoleSubject.next(role);
          } else {
            const residentDoc = await getDoc(doc(db, 'residents', user.uid));
            if (residentDoc.exists()) {
              console.log('User role: resident (from residents collection)');
              this.currentUserRoleSubject.next('resident');
            } else {
              console.log('No user doc in users or residents collection');
              this.currentUserRoleSubject.next(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        this.currentUserRoleSubject.next(null);
      }
      // Mark auth as initialized after we've processed the auth state once
      if (!this.initializedSubject.value) {
        this.initializedSubject.next(true);
      }
    });
  }

  // Get current user
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  // Get current user's role
  getCurrentUserRole(): Observable<string | null> {
    return this.currentUserRole$;
  }

  // Get current user role synchronously
  getCurrentUserRoleSync(): string | null {
    return this.currentUserRoleSubject.value;
  }

  // Wait for role to be loaded
  getRoleWhenReady(): Observable<string | null> {
    return this.currentUserRole$.pipe(
      filter(role => role !== null || this.currentUserSubject.value === null)
    );
  }

  // Expose auth initialized observable
  getAuthInitialized(): Observable<boolean> {
    return this.authInitialized$;
  }

  // Sign up resident
  // Accept optional resident profile to create a residents document that matches staff-created records
  signUpResident(email: string, password: string, name: string, residentProfile?: Partial<import('../models').Resident>): Promise<any> {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(result => {
        console.log('Firebase user created:', result.user.uid);
        return updateProfile(result.user, { displayName: name })
          .then(async () => {
            console.log('Profile updated');
            // Create a resident record so staff reports and resident management include this user.
            // NOTE: Residents are stored under `residents/{uid}`; `users` collection is for staff/admin.
            try {
              const profile = residentProfile || {};
              const dob = profile.dateOfBirth ? new Date(profile.dateOfBirth as any) : null;
              await setDoc(doc(db, 'residents', result.user.uid), {
                id: result.user.uid,
                name: profile.name || name,
                dateOfBirth: dob,
                gender: profile.gender || 'other',
                address: profile.address || '',
                barangay: profile.barangay || '',
                phone: profile.phone || '',
                email: email,
                civilStatus: profile.civilStatus || 'single',
                occupation: profile.occupation || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: result.user.uid
              });
              console.log('Resident document created in Firestore');
            } catch (resErr) {
              console.error('Failed to create resident document:', resErr);
            }
            return result;
          });
      })
      .catch(error => {
        console.error('Sign up error:', error);
        throw error;
      });
  }

  // Sign up staff (role can be provided; default is 'staff')
  signUpStaff(email: string, password: string, name: string, role: string = 'staff'): Promise<any> {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(result => {
        console.log('Firebase user created:', result.user.uid);
        return updateProfile(result.user, { displayName: name })
          .then(async () => {
            console.log('Profile updated');
            // Create user document in Firestore
            return setDoc(doc(db, 'users', result.user.uid), {
              email: email,
              name: name,
              role: role,
              createdAt: new Date().toISOString(),
              uid: result.user.uid
            }).then(() => {
              console.log('User document created in Firestore');
              return result;
            });
          });
      })
      .catch(error => {
        console.error('Sign up error:', error);
        throw error;
      });
  }

  /**
   * Create a staff account from the client while restoring the current admin session.
   * This method creates the new auth user (which will briefly become the current user),
   * writes the users/{uid} document with audit fields, then attempts to sign back in
   * as the admin using the provided adminPassword. If re-sign-in fails the newly created
   * account and user document are removed to avoid leaving a broken state.
   *
   * Warning: This is a client-side workaround. The recommended production approach is
   * to create users via a server-side Admin SDK (Cloud Function) to avoid switching
   * the client session.
   */
  async createStaffAsAdmin(newEmail: string, newPassword: string, name: string, role: string = 'staff', adminPassword: string): Promise<any> {
    const adminEmail = auth.currentUser?.email || null;
    const adminUid = auth.currentUser?.uid || null;

    if (!adminEmail || !adminUid) {
      throw new Error('No authenticated admin user available to create staff.');
    }

    let createdUserResult: any = null;
    try {
      // Create the new user (this will sign in as the new user)
      createdUserResult = await createUserWithEmailAndPassword(auth, newEmail, newPassword);
      await updateProfile(createdUserResult.user, { displayName: name });

      // Create Firestore user doc with audit fields referencing admin
      await setDoc(doc(db, 'users', createdUserResult.user.uid), {
        email: newEmail,
        name: name,
        role: role,
        createdAt: new Date().toISOString(),
        uid: createdUserResult.user.uid,
        createdBy: adminUid
      });

      // Try to re-sign-in as the admin using the password provided by admin
      try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        // onAuthStateChanged listener will update currentUserSubject and role
        return { user: createdUserResult.user };
      } catch (reSignErr: any) {
        console.error('Failed to re-authenticate admin after creating new user:', reSignErr);
        // Attempt cleanup: delete created auth user and users doc
        try {
          // As we're currently signed in as createdUserResult.user, we can delete it
          await deleteUser(createdUserResult.user);
        } catch (delErr) {
          console.error('Failed to delete newly created auth user during cleanup:', delErr);
        }
        try {
          await setDoc(doc(db, 'users', createdUserResult.user.uid), {});
          // best-effort: delete the doc
        } catch (docDelErr) {
          console.error('Failed to cleanup users doc for created user:', docDelErr);
        }
        throw new Error('Failed to re-authenticate admin after creating staff. No changes were persisted. Please try again or use server-side creation.');
      }
    } catch (err) {
      console.error('Error creating staff as admin:', err);
      // If a partial created account exists, attempt to clean up
      if (createdUserResult && createdUserResult.user) {
        try {
          await deleteUser(createdUserResult.user);
        } catch (delErr) {
          console.error('Failed to delete partially created user:', delErr);
        }
        try {
          // attempt delete users doc
          await setDoc(doc(db, 'users', createdUserResult.user.uid), {});
        } catch (docErr) {
          console.error('Failed to clear users doc after error:', docErr);
        }
      }
      throw err;
    }
  }

  // Login with role verification
  async login(email: string, password: string, expectedRole: 'staff' | 'resident'): Promise<any> {
    try {
      console.log(`Attempting login as ${expectedRole} with email: ${email}`);
      
      // Sign in the user
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase sign in successful:', result.user.uid);
      
      // Verify the user's role/record depending on expectedRole
      if (expectedRole === 'resident') {
        const residentDoc = await getDoc(doc(db, 'residents', result.user.uid));
        if (!residentDoc.exists()) {
          console.error('Resident document not found in Firestore');
          await signOut(auth);
          throw new Error('Resident profile not found. Please contact admin.');
        }
        console.log('Login successful as resident');
        this.currentUserRoleSubject.next('resident');
      } else {
        // staff/admin login: check users collection for role
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDoc.exists()) {
          console.error('User document not found in Firestore');
          await signOut(auth);
          throw new Error('User profile not found. Please contact admin.');
        }
        const userRole = userDoc.data()['role'];
        console.log('User role from Firestore:', userRole, 'Expected:', expectedRole);
        if (userRole !== expectedRole) {
          console.error(`Role mismatch: User is ${userRole} but tried to login as ${expectedRole}`);
          await signOut(auth);
          throw new Error(`This account is registered as a ${userRole}, not a ${expectedRole}. Please use the correct login type.`);
        }
        console.log('Login successful with correct role');
        this.currentUserRoleSubject.next(userRole);
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout
//   logout(): Promise<void> {
//     return signOut(auth);
//   }
logout(): Promise<void> {
  return signOut(auth).then(() => {
    console.log('✅ User logged out');
    this.currentUserSubject.next(null);
    this.currentUserRoleSubject.next(null);
    window.location.href = '/login';   // 👈 hard reload
  });
}

  // Get user ID token
  getToken(): Promise<string> {
    return auth.currentUser?.getIdToken() ?? Promise.resolve('');
  }

  // Cleanup
  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  
}
