import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, DocumentRequestService, AnnouncementService } from '../../../services';
import { DocumentRequest, Announcement } from '../../../models';
import { take, switchMap, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-resident-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resident-dashboard.component.html',
  styleUrl: './resident-dashboard.component.css'
})
export class ResidentDashboardComponent implements OnInit {
  mobileSidebarOpen = false;
  currentUser$: any;
  recentRequests: DocumentRequest[] = [];
  recentAnnouncements: Announcement[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private documentRequestService: DocumentRequestService,
    private announcementService: AnnouncementService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Wait for auth to be initialized, then load recent requests and set up reload on navigation
    this.authService.getAuthInitialized()
      .pipe(take(1))
      .subscribe(() => {
        const currentUser = this.authService['currentUserSubject'].value;
        if (currentUser?.uid) {
          this.loadRecentRequestsForUser(currentUser.uid);
          this.loadRecentAnnouncements();

          // Reload when navigating back to the resident dashboard
          this.router.events
            .pipe(filter((e: any) => e.constructor.name === 'NavigationEnd'))
            .subscribe(() => {
              this.loadRecentRequestsForUser(currentUser.uid);
              this.loadRecentAnnouncements();
            });
        } else {
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  private loadRecentAnnouncements(): void {
    // show a small loading state separately if desired
    this.announcementService.getActiveAnnouncements().subscribe({
      next: (anns: Announcement[]) => {
        this.recentAnnouncements = (anns || []).slice(0, 3);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Failed to load recent announcements', err);
      }
    });
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen = false;
  }

  private loadRecentRequestsForUser(uid: string): void {
    this.loading = true;
    this.documentRequestService.getRequestsByResidentId(uid).subscribe({
      next: (requests: DocumentRequest[]) => {
        this.recentRequests = requests
          .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
          .slice(0, 5);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateTo(path: string): void {
    this.router.navigate(['/resident', path]);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'approved':
        return '#28a745';
      case 'ready_for_pickup':
        return '#17a2b8';
      case 'rejected':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toUpperCase();
  }
}
