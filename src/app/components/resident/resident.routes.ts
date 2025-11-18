import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';

export const RESIDENT_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/resident-dashboard.component').then(m => m.ResidentDashboardComponent)
  },
  {
    path: 'request-document',
    loadComponent: () => import('./request-document/request-document.component').then(m => m.RequestDocumentComponent)
  },
  {
    path: 'profile',
    loadComponent: () => Promise.resolve(ProfileComponent)
  },
  {
    path: 'my-requests',
    loadComponent: () => import('./my-requests/my-requests.component').then(m => m.MyRequestsComponent)
  },
  {
    path: 'announcements',
    loadComponent: () => import('./announcements/resident-announcements.component').then(m => m.ResidentAnnouncementsComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
