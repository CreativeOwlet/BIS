import { Routes } from '@angular/router';
import { AuthGuard, StaffGuard, ResidentGuard } from './guards/auth.guard';

export const routes: Routes = [
  
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'staff',
    canActivate: [ StaffGuard],
    loadChildren: () => import('./components/staff/staff.routes').then(m => m.STAFF_ROUTES)
  },
  {
    path: 'resident',
    canActivate: [ResidentGuard],
    loadChildren: () => import('./components/resident/resident.routes').then(m => m.RESIDENT_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
