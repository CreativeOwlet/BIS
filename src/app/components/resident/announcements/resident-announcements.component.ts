import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router, NavigationEnd } from '@angular/router';
import { AnnouncementService } from '../../../services';
import { Announcement } from '../../../models';
import { Subject, filter } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-resident-announcements',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './resident-announcements.component.html',
  styleUrl: './resident-announcements.component.css'
})
export class ResidentAnnouncementsComponent implements OnInit, OnDestroy {
  announcements: Announcement[] = [];
  loading = true;
  error = '';
  selectedAnnouncement: Announcement | null = null;
  categoryFilter = 'all';
  private destroy$ = new Subject<void>();


  constructor(
    private announcementService: AnnouncementService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Listen for navigation events to reload announcements when this route is entered
    this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadAnnouncements();
      });
  }

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  goBack(): void {
    this.router.navigate(['/resident']);
  }

  loadAnnouncements(): void {
    this.loading = true;
    this.announcementService.getActiveAnnouncements()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.announcements = data.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          // If a details modal is open, update the selectedAnnouncement with the latest data
          if (this.selectedAnnouncement) {
            const updated = this.announcements.find(a => a.id === this.selectedAnnouncement!.id);
            this.selectedAnnouncement = updated || null;
          }
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('ResidentAnnouncementsComponent: loadAnnouncements error', err);
          this.error = 'Failed to load announcements: ' + (err?.message || String(err));
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  filterByCategory(category: string): void {
    this.categoryFilter = category;
  }

  getFilteredAnnouncements(): Announcement[] {
    if (this.categoryFilter === 'all') {
      return this.announcements;
    }
    return this.announcements.filter(a => a.category === this.categoryFilter);
  }

  selectAnnouncement(announcement: Announcement): void {
    this.selectedAnnouncement = announcement;
    // Ensure view updates immediately
    this.cdr.markForCheck();
  }

  closeDetails(): void {
    this.selectedAnnouncement = null;
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
  }
}
