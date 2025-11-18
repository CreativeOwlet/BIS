import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  dateOfBirth = '';
  gender: 'male' | 'female' | 'other' = 'other';
  address = '';
  barangay = '';
  phone = '';
  civilStatus: 'single' | 'married' | 'widowed' | 'divorced' = 'single';
  occupation = '';
  loading = false;
  error = '';
  success = '';
  get calculatedAge(): number | null {
    if (!this.dateOfBirth) return null;
    const d = new Date(this.dateOfBirth);
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    return age;
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async signup(): Promise<void> {
    this.error = '';
    this.success = '';
    this.loading = true;

    // Validate inputs
    if (!this.name || !this.email || !this.password) {
      this.error = 'All fields are required';
      this.loading = false;
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      this.loading = false;
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      this.loading = false;
      return;
    }

    try {
      console.log(`Attempting to sign up resident with email: ${this.email}`);
      
      // Signup flow is resident-only from the public signup page
      if (true) {
        const profile = {
          name: this.name,
          dateOfBirth: this.dateOfBirth ? new Date(this.dateOfBirth) : undefined,
          gender: this.gender,
          address: this.address,
          barangay: this.barangay,
          phone: this.phone,
          civilStatus: this.civilStatus,
          occupation: this.occupation
        };
        await this.authService.signUpResident(this.email, this.password, this.name, profile);
      }

      this.success = 'Account created successfully!';
      console.log('Sign up successful');
      
      setTimeout(() => {
        this.router.navigate(['/resident/dashboard']);
      }, 2000);
    } catch (err: any) {
      console.error('Sign up error:', err);
      
      // Firebase error handling
      if (err.code === 'auth/email-already-in-use') {
        this.error = 'Email is already registered';
      } else if (err.code === 'auth/invalid-email') {
        this.error = 'Invalid email address';
      } else if (err.code === 'auth/weak-password') {
        this.error = 'Password is too weak';
      } else {
        this.error = err.message || 'Sign up failed. Please check the console for details.';
      }
      
      this.loading = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}

