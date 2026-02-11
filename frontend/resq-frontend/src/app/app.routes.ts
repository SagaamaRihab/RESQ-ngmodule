import { Routes } from '@angular/router';

<<<<<<< HEAD

import { HomeComponent } from './features/home/home.component';
import { SigninComponent } from './shared/components/auth/Signin/signin.component';
import { SignupComponent } from './shared/components/auth/Signup/signup.component';
import { EvacuationComponent } from './features/user/pages/evacuation/evacuation.component';

import { UserComponent } from './features/user/user.component';
import { UserDashboardComponent } from './features/user/pages/dashboard/user-dashboard.component';
import { UserMapComponent } from './features/user/pages/map/user-map.component';
import { InstructionsComponent } from './features/user/pages/instructions/instruction.component';
import { UserProfileComponent } from './features/user/profile/profile.component';

import { AdminComponent } from './features/admin/admin.component';
import { AdminDashboardComponent } from './features/admin/pages/admin-dashboard/admin-dashboard.component';
import { Corridors } from './features/admin/pages/corridors/corridors';
import { Map } from './features/admin/pages/map/map';
import { Evacuations } from './features/admin/pages/evacuations/evacuations';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { BuildingComponent } from './features/user/pages/map/building/building.component';

export const routes: Routes = [

  // =====================
  // PUBLIC
  // =====================
=======
import { HomeComponent } from './features/home/home.component';
import { SigninComponent } from './shared/components/Signin/signin.component';
import { SignupComponent } from './shared/components/Signup/signup.component';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // HOME & AUTH
>>>>>>> d12f3495f6000279035466c8b05ea12879007f17
  { path: '', component: HomeComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },

<<<<<<< HEAD
  // =====================
  // USER AREA
  // =====================
    {
      path: 'user',
      component: UserComponent,
      canActivate: [AuthGuard, RoleGuard],
      canActivateChild: [RoleGuard],

      data: { roles: ['USER', 'ADMIN'] },
      children: [
        { path: '', component: UserDashboardComponent },
        { path: 'profile', component: UserProfileComponent },
        {
          path: 'map',
          children: [
            { path: '', component: UserMapComponent },
            { path: ':building', component: BuildingComponent }
          ]
        },

        { path: 'evacuation', component: EvacuationComponent },
        { path: 'instructions', component: InstructionsComponent }
      ]
    },


  // =====================
  // ADMIN AREA
  // =====================
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }, // ✅
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'corridors', component: Corridors },
      { path: 'map', component: Map },
      { path: 'evacuations', component: Evacuations }
    ]
  },


  // =====================
  // FALLBACK
  // =====================
  { path: '**', redirectTo: '' }
=======
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
>>>>>>> d12f3495f6000279035466c8b05ea12879007f17
];
