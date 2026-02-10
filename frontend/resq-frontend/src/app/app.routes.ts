import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { SigninComponent } from './shared/components/Signin/signin.component';
import { SignupComponent } from './shared/components/Signup/signup.component';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // HOME & AUTH
  { path: '', component: HomeComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },

  // ADMIN (protégé)
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'corridors',
        loadComponent: () =>
          import('./features/admin/corridors/corridors').then((m) => m.CorridorsComponent),
      },
      {
        path: 'map',
        loadComponent: () =>
          import('./features/admin/map/map').then((m) => m.Map),
      },
      {
        path: 'evacuations',
        loadComponent: () =>
          import('./features/admin/evacuations/evacuations').then(
            (m) => m.EvacuationsComponent
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // FALLBACK
  { path: '**', redirectTo: '' },
];
