import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResidentService, AuthService } from '../../../services';
import { Resident } from '../../../models';
import { ChangeDetectorRef } from '@angular/core';
import { take, switchMap } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  resident: Partial<Resident> = {};
  loading = true;
  saving = false;
  error = '';
  success = '';

  constructor(
    private residentService: ResidentService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Wait for auth system to initialize to avoid racing with onAuthStateChanged
    this.authService.getAuthInitialized().pipe(
      take(1),
      switchMap(() => this.authService.getCurrentUser().pipe(take(1)))
    ).subscribe({
      next: (user) => {
        console.log('ProfileComponent: auth initialized, current user =', user?.uid || null);
        if (user && user.uid) {
          this.residentService.getResidentById(user.uid).pipe(take(1)).subscribe({
            next: (r) => {
              console.log('ProfileComponent: resident fetch result =', r);
              if (r) {
                this.resident = r as Partial<Resident>;
              } else {
                this.error = 'Resident profile not found.';
              }
              this.loading = false;
              this.cdr.markForCheck();
            },
            error: (err) => {
              console.error('ProfileComponent: failed to load resident', err);
              this.error = 'Failed to load profile.';
              this.loading = false;
              this.cdr.markForCheck();
            }
          });
        } else {
          this.error = 'No authenticated user.';
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('ProfileComponent: auth initialization error', err);
        this.error = 'Authentication initialization failed.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  save(): void {
    this.error = '';
    this.success = '';
    if (!this.resident?.id) {
      this.error = 'No resident id.';
      return;
    }
    this.saving = true;
    // Normalize and validate dateOfBirth before updating
    let dob: Date | undefined = undefined;
    if (this.resident.dateOfBirth) {
      const candidate = new Date(this.resident.dateOfBirth as any);
      if (!isNaN(candidate.getTime())) {
        dob = candidate;
      }
    }

    const updatePayload: Partial<Resident> = {
      name: this.resident.name as any || '',
      phone: this.resident.phone as any || '',
      address: this.resident.address as any || '',
      barangay: this.resident.barangay as any || '',
      occupation: this.resident.occupation as any || '',
      civilStatus: this.resident.civilStatus as any,
      gender: this.resident.gender as any,
      ...(dob ? { dateOfBirth: dob } : {}),
      updatedAt: new Date()
    } as any;

    this.residentService.updateResident(this.resident.id as string, updatePayload).pipe(take(1)).subscribe(() => {
      this.saving = false;
      this.success = 'Profile updated successfully.';
    }, err => {
      this.saving = false;
      this.error = 'Failed to update profile.';
    });
  }

  goBack(): void {
    this.router.navigate(['/resident']);
  }
}
