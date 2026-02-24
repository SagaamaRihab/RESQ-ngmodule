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
import { BuildingComponent } from './features/user/pages/map/building/building.component';

import { AdminComponent } from './features/admin/admin.component';
import { AdminDashboardComponent } from './features/admin/pages/admin-dashboard/admin-dashboard.component';
import { CorridorsComponent } from './features/admin/pages/corridors/corridors';
import { AdminBuildingComponent} from './features/admin/pages/map/building/admin-building.component';

import {AdminMapComponent} from './features/admin/pages/map/admin-map.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { AdminEvacuationComponent } from './features/admin/pages/evacuation/ admin-evacuation.component';



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
    data: { roles: ['ADMIN'] },

    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'corridors', component: CorridorsComponent },

      { path: 'evacuations', component: AdminEvacuationComponent },
      { path: 'instructions', component: InstructionsComponent },
      
      { path: 'map', component: AdminMapComponent },
      { path: 'map/:building', component: AdminBuildingComponent },
    ]
  },

  // =====================
  // FALLBACK
  // =====================
  { path: '**', redirectTo: '' }
];
