import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  userType: 'staff' | 'resident' = 'resident';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  async login(): Promise<void> {
    this.error = '';
    this.loading = true;

    // Validate inputs
    if (!this.email || !this.password) {
      this.error = 'Email and password are required';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    try {
      console.log(`Logging in as ${this.userType}...`);
      
      // Pass the expected role to the login method
      await this.authService.login(this.email, this.password, this.userType);
      
      console.log(`Successfully logged in as ${this.userType}`);
      
      if (this.userType === 'staff') {
        this.router.navigate(['/staff/dashboard']);
      } else {
        this.router.navigate(['/resident/dashboard']);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Map Firebase error codes to user-friendly messages
      if (err.code === 'auth/user-not-found') {
        this.error = 'No account found with this email';
      } else if (err.code === 'auth/wrong-password') {
        this.error = 'Incorrect password';
      } else if (err.code === 'auth/invalid-email') {
        this.error = 'Invalid email address';
      } else {
        this.error = err.message || 'Login failed';
      }
      
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
