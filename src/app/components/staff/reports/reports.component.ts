import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ReportService } from '../../../services';
import { ResidentReport, DocumentReport } from '../../../models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit, OnDestroy {
  residentReport: ResidentReport | null = null;
  documentReport: DocumentReport | null = null;
  loading = true;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(private reportService: ReportService, private router: Router) {}

  ngOnInit(): void {
    this.loadReports();
  }

  goBack(): void {
    this.router.navigate(['/staff']);
  }

  loadReports(): void {
    this.loading = true;

    this.reportService.getResidentStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.residentReport = report;
        },
        error: (err) => {
          this.error = 'Failed to load resident statistics';
        }
      });

    this.reportService.getDocumentStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.documentReport = report;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load document statistics';
          this.loading = false;
        }
      });
  }

  getCompletionPercentage(): number {
    if (!this.documentReport) return 0;
    const total = this.documentReport.totalDocumentsIssued + this.documentReport.pendingRequests;
    if (total === 0) return 0;
    return Math.round((this.documentReport.totalDocumentsIssued / total) * 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
