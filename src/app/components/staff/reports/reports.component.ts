import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ReportService } from '../../../services';
import { ResidentReport, DocumentReport } from '../../../models';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnDestroy {
  residentReport: ResidentReport | null = null;
  documentReport: DocumentReport | null = null;
  loading = true;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private reportService: ReportService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  goBack(): void {
    this.router.navigate(['/staff']);
  }

  loadReports(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      residents: this.reportService.getResidentStatistics(),
      documents: this.reportService.getDocumentStatistics()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reports) => {
          this.residentReport = reports.residents;
          this.documentReport = reports.documents;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading reports:', err);
          this.error = 'Failed to load reports. Please try again.';
          this.loading = false;
          this.cdr.detectChanges();
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
