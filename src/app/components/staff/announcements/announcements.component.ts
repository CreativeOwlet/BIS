import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { AnnouncementService, AuthService } from '../../../services';
import { Announcement } from '../../../models';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css'
})

export class AnnouncementsComponent implements OnInit, OnDestroy {
  announcements: Announcement[] = [];
  loading = true;
  error = '';
  showAddForm = false;
  selectedMenuId: string | null = null;
  selectedAnnouncement: Announcement | null = null;
  // Snackbar (undo) state
  snackbarVisible = false;
  snackbarMessage = '';
  snackbarTimeout = 5000; // ms
  snackbarTimer: any = null;
  lastDeletedAnnouncement: Announcement | null = null;
  private destroy$ = new Subject<void>();

  newAnnouncement = {
    title: '',
    content: '',
    category: 'update' as const,
    isActive: true
  };

  constructor(
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  openMenu(event: Event, announcementId: string): void {
    event.stopPropagation();
    this.selectedMenuId = this.selectedMenuId === announcementId ? null : announcementId;
    this.cdr.markForCheck();
  }

  closeMenu(): void {
    this.selectedMenuId = null;
    this.cdr.markForCheck();
  }

  selectAnnouncement(announcement: Announcement): void {
    this.selectedAnnouncement = announcement;
    this.cdr.markForCheck();
  }

  closeAnnouncementDetails(): void {
    this.selectedAnnouncement = null;
    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    // Wait for auth to be initialized before loading announcements
    this.authService.getAuthInitialized()
      .pipe(take(1))
      .subscribe(() => {
        this.loadAnnouncements();
      });
  }

  goBack(): void {
    this.router.navigate(['/staff']);
  }

  loadAnnouncements(): void {
    this.loading = true;
    this.announcementService.getAllAnnouncements()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.announcements = data.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = 'Failed to load announcements';
          this.loading = false;
          this.cdr.markForCheck();
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
    this.newAnnouncement = {
      title: '',
      content: '',
      category: 'update',
      isActive: true
    };
  }

  addAnnouncement(): void {
    if (!this.newAnnouncement.title || !this.newAnnouncement.content) {
      this.error = 'Title and content are required';
      return;
    }

    const currentUser = this.authService['currentUserSubject'].value;
    const announcementToAdd = {
      ...this.newAnnouncement,
      createdBy: currentUser?.uid || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.announcementService.createAnnouncement(announcementToAdd)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeAddForm();
          this.loadAnnouncements();
        },
        error: (err) => {
          this.error = 'Failed to create announcement';
          this.cdr.markForCheck();
        }
      });
  }

  deleteAnnouncement(id: string): void {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    // Optimistic UI: remove locally and show undo snackbar. Actual delete is performed after timeout.
    const idx = this.announcements.findIndex(a => a.id === id);
    if (idx === -1) { return; }

    this.lastDeletedAnnouncement = this.announcements[idx];
    // remove from list
    this.announcements.splice(idx, 1);
    this.closeMenu();
    this.snackbarMessage = 'Announcement deleted';
    this.snackbarVisible = true;
    this.cdr.markForCheck();

    // schedule actual delete
    if (this.snackbarTimer) { clearTimeout(this.snackbarTimer); }
    this.snackbarTimer = window.setTimeout(() => {
      this.performDelete(id);
    }, this.snackbarTimeout);
  }

  toggleActive(announcement: Announcement): void {
    this.announcementService.updateAnnouncement(announcement.id, {
      isActive: !announcement.isActive
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeMenu();
          this.loadAnnouncements();
        },
        error: (err) => {
          this.error = 'Failed to update announcement';
          this.cdr.markForCheck();
        }
      });
  }

  // Perform the backend delete (called after snackbar timeout)
  private performDelete(id: string): void {
    this.announcementService.deleteAnnouncement(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackbarVisible = false;
          this.snackbarTimer = null;
          this.lastDeletedAnnouncement = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          // Reinsert locally and show error
          if (this.lastDeletedAnnouncement) {
            this.announcements.unshift(this.lastDeletedAnnouncement);
          }
          this.error = 'Failed to delete announcement';
          this.snackbarVisible = false;
          this.snackbarTimer = null;
          this.lastDeletedAnnouncement = null;
          this.cdr.markForCheck();
        }
      });
  }

  undoDelete(): void {
    if (this.snackbarTimer) {
      clearTimeout(this.snackbarTimer);
      this.snackbarTimer = null;
    }
    if (this.lastDeletedAnnouncement) {
      this.announcements.unshift(this.lastDeletedAnnouncement);
    }
    this.lastDeletedAnnouncement = null;
    this.snackbarVisible = false;
    this.cdr.markForCheck();
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'event':
        return '🎉';
      case 'alert':
        return '⚠️';
      case 'update':
        return '📢';
      default:
        return '📝';
    }
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'event':
        return 'Event';
      case 'alert':
        return 'Alert';
      case 'update':
        return 'Update';
      default:
        return 'Other';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.snackbarTimer) {
      clearTimeout(this.snackbarTimer);
      this.snackbarTimer = null;
    }
  }
}
