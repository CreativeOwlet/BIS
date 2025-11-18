import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ResidentService, AuthService } from '../../../services';
import { Resident } from '../../../models';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

@Component({
  selector: 'app-residents',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './residents.component.html',
  styleUrl: './residents.component.css'
})
export class ResidentsComponent implements OnInit, OnDestroy {
  residents: Resident[] = [];
  loading = true;
  error = '';
  showAddForm = false;
  // Edit state
  selectedResident: Partial<Resident> | null = null;
  searchQuery = '';
  private destroy$ = new Subject<void>();

  newResident = {
    name: '',
    dateOfBirth: '',
    gender: 'male' as const,
    address: '',
    barangay: '',
    phone: '',
    email: '',
    civilStatus: 'single' as const,
    occupation: ''
  };

  constructor(
    private residentService: ResidentService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Wait for auth initialization to ensure Firestore rules and auth state are ready
    this.authService.getAuthInitialized()
      .pipe(take(1))
      .subscribe(() => {
        this.loadResidents();
      });
  }

  goBack(): void {
    this.router.navigate(['/staff']);
  }

  loadResidents(): void {
    this.loading = true;
    this.residentService.getAllResidents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.residents = data;
          this.loading = false;
          this.cdr?.markForCheck();
        },
        error: (err) => {
          this.error = 'Failed to load residents';
          this.loading = false;
          this.cdr?.markForCheck();
        }
      });
  }

  searchResidents(): void {
    if (!this.searchQuery) {
      this.loadResidents();
      return;
    }

    this.residentService.searchResidents(this.searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.residents = data;
        },
        error: (err) => {
          this.error = 'Search failed';
        }
      });
  }

  openAddForm(): void {
    this.showAddForm = true;
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newResident = {
      name: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      barangay: '',
      phone: '',
      email: '',
      civilStatus: 'single',
      occupation: ''
    };
  }

  openEdit(resident: Resident): void {
    // Clone to avoid mutating table directly until saved
    // Format dateOfBirth as yyyy-MM-dd string for input[type=date]
    let dateOfBirth = '';
    if (resident.dateOfBirth) {
      let d: Date;
      if (typeof resident.dateOfBirth === 'object' && typeof (resident.dateOfBirth as any).toDate === 'function') {
        d = (resident.dateOfBirth as any).toDate();
      } else if (typeof resident.dateOfBirth === 'number') {
        d = new Date(resident.dateOfBirth);
      } else {
        d = new Date(resident.dateOfBirth);
      }
      if (!isNaN(d.getTime())) {
        // Format as yyyy-MM-dd
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        dateOfBirth = `${d.getFullYear()}-${month}-${day}`;
      }
    }
  this.selectedResident = { ...resident, dateOfBirth: dateOfBirth as any } as Partial<Resident>;
  }

  closeEdit(): void {
    this.selectedResident = null;
  }

  saveEdit(): void {
    if (!this.selectedResident || !this.selectedResident.id) {
      this.error = 'No resident selected for editing.';
      return;
    }
    const id = this.selectedResident.id as string;
    // Validate and normalize dateOfBirth: only include if it parses to a valid Date
    let dob: Date | undefined = undefined;
    if (this.selectedResident.dateOfBirth) {
      const candidate = new Date(this.selectedResident.dateOfBirth as any);
      if (!isNaN(candidate.getTime())) {
        dob = candidate;
      } else {
        // invalid date string, skip including dateOfBirth to avoid Firestore serialization errors
        dob = undefined;
      }
    }

    const payload: Partial<Resident> = {
      name: this.selectedResident.name,
      ...(dob ? { dateOfBirth: dob } : {}),
      gender: this.selectedResident.gender as any,
      address: this.selectedResident.address,
      barangay: this.selectedResident.barangay,
      phone: this.selectedResident.phone,
      email: this.selectedResident.email,
      civilStatus: this.selectedResident.civilStatus as any,
      occupation: this.selectedResident.occupation,
      updatedAt: new Date()
    };

    this.residentService.updateResident(id, payload).pipe(take(1)).subscribe({
      next: () => {
        this.closeEdit();
        this.loadResidents();
      },
      error: (err) => {
        console.error('Failed to update resident', err);
        this.error = 'Failed to update resident.';
      }
    });
  }

  addResident(): void {
    if (!this.newResident.name || !this.newResident.email) {
      this.error = 'Name and email are required';
      return;
    }

    const currentUser = this.authService['currentUserSubject'].value;
    const residentToAdd = {
      ...this.newResident,
      dateOfBirth: new Date(this.newResident.dateOfBirth),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: currentUser?.uid || 'unknown'
    };

    this.residentService.addResident(residentToAdd)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeAddForm();
          this.loadResidents();
        },
        error: (err) => {
          this.error = 'Failed to add resident';
        }
      });
  }

  deleteResident(id: string): void {
    if (confirm('Are you sure you want to delete this resident?')) {
      this.residentService.deleteResident(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadResidents();
          },
          error: (err) => {
            this.error = 'Failed to delete resident';
          }
        });
    }
  }

  calculateAge(dateOfBirth: any): number {
    if (!dateOfBirth) return 0;
    // Normalize Firestore Timestamp or string/date input
    let d: Date;
    try {
      if (typeof dateOfBirth === 'object' && typeof (dateOfBirth as any).toDate === 'function') {
        d = (dateOfBirth as any).toDate();
      } else if (typeof dateOfBirth === 'number') {
        d = new Date(dateOfBirth);
      } else {
        d = new Date(dateOfBirth);
      }
    } catch (e) {
      return 0;
    }
    if (isNaN(d.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const monthDiff = today.getMonth() - d.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    return age;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
