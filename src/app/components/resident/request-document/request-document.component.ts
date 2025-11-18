import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { DocumentRequestService, AuthService } from '../../../services';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-request-document',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule],
  templateUrl: './request-document.component.html',
  styleUrl: './request-document.component.css'
})
export class RequestDocumentComponent implements OnDestroy {
  loading = false;
  error = '';
  success = '';
  private destroy$ = new Subject<void>();

  formData = {
    documentType: 'barangay_clearance',
    purpose: '',
    residentName: ''
  };

  constructor(
    private documentRequestService: DocumentRequestService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    const currentUser = this.authService['currentUserSubject'].value;
    if (currentUser) {
      this.formData.residentName = currentUser.displayName || currentUser.email || '';
    }
  }

  goBack(): void {
    this.router.navigate(['/resident']);
  }

  submitRequest(): void {
    this.error = '';
    this.success = '';

    if (!this.formData.documentType || !this.formData.purpose) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    const currentUser = this.authService['currentUserSubject'].value;

    const request = {
      residentId: currentUser?.uid || '',
      residentName: this.formData.residentName,
      documentType: this.formData.documentType as any,
      purpose: this.formData.purpose,
      status: 'pending' as const,
      requestDate: new Date()
    };

    this.documentRequestService.createRequest(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success = 'Request submitted successfully! Check your requests to track the status.';
          this.loading = false;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.router.navigate(['/resident/my-requests']);
          }, 2000);
        },
        error: (err) => {
          this.error = 'Failed to submit request. Please try again.';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }



  documentTypes = [
    { value: 'barangay_clearance', label: 'Barangay Clearance' },
    { value: 'certificate_of_residency', label: 'Certificate of Residency' },
    { value: 'certificate_of_indigency', label: 'Certificate of Indigency' }
  ];

  getDocumentDescription(type: string): string {
    switch (type) {
      case 'barangay_clearance':
        return 'A certificate issued by the barangay certifying that the applicant is a resident and has no criminal records in the barangay.';
      case 'certificate_of_residency':
        return 'A document certifying that a person is a registered resident of the barangay.';
      case 'certificate_of_indigency':
        return 'A document certifying that the applicant is a resident of low income or indigent status.';
      default:
        return '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
