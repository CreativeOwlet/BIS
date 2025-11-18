import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentRequestService, AuthService } from '../../../services';
import { DocumentRequest } from '../../../models';
import { ButtonModule } from 'primeng/button';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.css'
})
export class RequestsComponent implements OnInit, OnDestroy {
  requests: DocumentRequest[] = [];
  filteredRequests: DocumentRequest[] = [];
  loading = true;
  error = '';
  selectedRequest: DocumentRequest | null = null;
  statusFilter = 'all';
  remarks = '';
  revisionReason = '';
  private destroy$ = new Subject<void>();

  constructor(
    private documentRequestService: DocumentRequestService,
    private authService: AuthService,
    private router: Router
    , private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Wait for auth initialization before loading requests (ensures Firestore access)
    this.authService.getAuthInitialized()
      .pipe(take(1))
      .subscribe(() => {
        this.loadRequests();
      });
  }

  goBack(): void {
    this.router.navigate(['/staff']);
  }

  loadRequests(): void {
    this.loading = true;
    this.documentRequestService.getAllRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.requests = data;
          this.filterRequests();
          this.loading = false;
          this.cdr?.markForCheck();
        },
        error: (err) => {
          this.error = 'Failed to load requests';
          this.loading = false;
          this.cdr?.markForCheck();
        }
      });
  }

  filterRequests(): void {
    if (this.statusFilter === 'all') {
      this.filteredRequests = this.requests;
    } else {
      this.filteredRequests = this.requests.filter(r => r.status === this.statusFilter);
    }
  }

  selectRequest(request: DocumentRequest): void {
    this.selectedRequest = request;
    this.remarks = '';
    this.revisionReason = '';
  }

  closeDetails(): void {
    this.selectedRequest = null;
    this.remarks = '';
    this.revisionReason = '';
  }

  approveRequest(): void {
    if (!this.selectedRequest) return;

    const currentUser = this.authService['currentUserSubject'].value;
    this.documentRequestService.approveRequest(this.selectedRequest.id, currentUser?.uid || 'unknown')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadRequests();
          this.closeDetails();
        },
        error: (err) => {
          this.error = 'Failed to approve request';
        }
      });
  }

  markReadyForPickup(): void {
    if (!this.selectedRequest) return;

    this.documentRequestService.markReadyForPickup(this.selectedRequest.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadRequests();
          this.closeDetails();
        },
        error: (err) => {
          this.error = 'Failed to update request';
        }
      });
  }

  rejectRequest(): void {
    if (!this.selectedRequest || !this.remarks) {
      this.error = 'Please provide a reason for rejection';
      return;
    }

    this.documentRequestService.rejectRequest(this.selectedRequest.id, this.remarks)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadRequests();
          this.closeDetails();
        },
        error: (err) => {
          this.error = 'Failed to reject request';
        }
      });
  }

  markCompleted(): void {
    if (!this.selectedRequest) return;

    this.documentRequestService.markCompleted(this.selectedRequest.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadRequests();
          this.closeDetails();
        },
        error: (err) => {
          this.error = 'Failed to mark as completed';
        }
      });
  }

  markNeedsRevision(): void {
    if (!this.selectedRequest || !this.revisionReason) {
      this.error = 'Please provide a reason for revision';
      return;
    }

    this.documentRequestService.markNeedsRevision(this.selectedRequest.id, this.revisionReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadRequests();
          this.closeDetails();
        },
        error: (err) => {
          this.error = 'Failed to mark as needs revision';
        }
      });
  }

  getStatusBadgeClass(status: string): string {
    // Return Tailwind utility classes for badges/dots.
    switch (status) {
      case 'pending':
        return 'bg-yellow-400 text-black';
      case 'approved':
        return 'bg-green-500 text-white';
      case 'ready_for_pickup':
        return 'bg-teal-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      case 'completed':
        return 'bg-blue-600 text-white';
      case 'needs_revision':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toUpperCase();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
