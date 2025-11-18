import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DocumentRequestService, AuthService } from '../../../services';
import { DocumentRequest } from '../../../models';
import { Subject } from 'rxjs';
import { takeUntil, take, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule],
  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.css'
})
export class MyRequestsComponent implements OnInit, OnDestroy {
  requests: DocumentRequest[] = [];
  filteredRequests: DocumentRequest[] = [];
  loading = true;
  error = '';
  statusFilter = 'all';
  selectedRequest: DocumentRequest | null = null;
  private destroy$ = new Subject<void>();
  private escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.selectedRequest) {
      this.closeDetails();
      this.cdr.markForCheck();
    }
  };

  constructor(
    private documentRequestService: DocumentRequestService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Accessibility: close modal with Escape
    window.addEventListener('keydown', this.escHandler);
    // Wait for auth to be initialized before loading requests
    this.authService.getAuthInitialized()
      .pipe(
        take(1),
        switchMap(() => this.documentRequestService.getAllRequests()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any) => {
          const currentUser = this.authService['currentUserSubject'].value;
          if (currentUser?.uid) {
            this.requests = (data as DocumentRequest[])
              .filter((r: DocumentRequest) => r.residentId === currentUser.uid)
              .sort((a: DocumentRequest, b: DocumentRequest) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
            this.filterRequests();
          }
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = 'Failed to load requests';
          this.loading = false;
          this.cdr.markForCheck();
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
    // Move focus into the dialog for keyboard users
    setTimeout(() => {
      const btn = document.querySelector('#request-details-close') as HTMLElement;
      btn?.focus();
      this.cdr.markForCheck();
    }, 0);
  }

  closeDetails(): void {
    this.selectedRequest = null;
  }

  goBack(): void {
    this.router.navigate(['/resident']);
  }

  getStatusBadgeClass(status: string): string {
    // Return Tailwind utility classes for badges/dots.
    // Used both for small badge spans and circular status dots.
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

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✓';
      case 'ready_for_pickup':
        return '📦';
      case 'rejected':
        return '✗';
      case 'completed':
        return '✅';
      case 'needs_revision':
        return '🔄';
      default:
        return '?';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('keydown', this.escHandler);
  }
}
