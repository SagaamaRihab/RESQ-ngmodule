import { Routes } from '@angular/router';


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
  { path: '', component: HomeComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },

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
];
