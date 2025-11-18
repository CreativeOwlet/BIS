import { Routes } from '@angular/router';

export const STAFF_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/staff-dashboard.component').then(m => m.StaffDashboardComponent)
  },
  {
    path: 'residents',
    loadComponent: () => import('./residents/residents.component').then(m => m.ResidentsComponent)
  },
  {
    path: 'requests',
    loadComponent: () => import('./requests/requests.component').then(m => m.RequestsComponent)
  },
  {
    path: 'announcements',
    loadComponent: () => import('./announcements/announcements.component').then(m => m.AnnouncementsComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
