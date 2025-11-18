import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { AuthService, ResidentService, DocumentRequestService, ReportService } from '../../../services';
import { ResidentReport, DocumentReport } from '../../../models';
import { take, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './staff-dashboard.component.html',
  styleUrl: './staff-dashboard.component.css'
})
export class StaffDashboardComponent implements OnInit {
  mobileSidebarOpen = false;
  currentUser$: any;
  residentReport: ResidentReport | null = null;
  documentReport: DocumentReport | null = null;
  loading = true;
  error = '';
  // Add Staff modal state
  showAddStaffModal = false;
  newStaff: { name: string; email: string; password: string; role: string; adminPassword?: string } = {
    name: '',
    email: '',
    password: '',
    role: 'staff',
    adminPassword: ''
  };
  createStaffLoading = false;
  createStaffSuccess = '';

  constructor(
    private authService: AuthService,
    private residentService: ResidentService,
    private documentRequestService: DocumentRequestService,
    private reportService: ReportService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Wait for auth to be initialized before loading dashboard data and reload on navigation
    this.authService.getAuthInitialized()
      .pipe(take(1))
      .subscribe(() => {
        this.loadDashboardData();

        this.router.events
          .pipe(filter((e: any) => e.constructor.name === 'NavigationEnd'))
          .subscribe(() => this.loadDashboardData());
      });
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.reportService.getResidentStatistics().subscribe({
      next: (report) => {
        this.residentReport = report;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Failed to load resident statistics';
        this.cdr.markForCheck();
      }
    });

    this.reportService.getDocumentStatistics().subscribe({
      next: (report) => {
        this.documentReport = report;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Failed to load document statistics';
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
    this.router.navigate(['/staff', path]);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen = false;
  }

  openAddStaff(): void {
    this.showAddStaffModal = true;
  }

  closeAddStaff(): void {
    this.showAddStaffModal = false;
    this.newStaff = { name: '', email: '', password: '', role: 'staff' };
  }

  async createStaff(): Promise<void> {
    this.error = '';
    this.createStaffSuccess = '';
    if (!this.newStaff.email || !this.newStaff.password || !this.newStaff.name) {
      this.error = 'Please provide name, email and password';
      return;
    }
    if (!this.newStaff.adminPassword) {
      this.error = 'Please enter your password to confirm staff creation (for re-authentication).';
      return;
    }

    this.createStaffLoading = true;
    try {
      await this.authService.createStaffAsAdmin(
        this.newStaff.email,
        this.newStaff.password,
        this.newStaff.name,
        this.newStaff.role,
        this.newStaff.adminPassword || ''
      );
      this.createStaffSuccess = 'Staff account created successfully.';
      this.closeAddStaff();
      // reload dashboard data
      this.loadDashboardData();
    } catch (err: any) {
      console.error('Failed to create staff:', err);
      this.error = err?.message || 'Failed to create staff';
    } finally {
      this.createStaffLoading = false;
    }
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
