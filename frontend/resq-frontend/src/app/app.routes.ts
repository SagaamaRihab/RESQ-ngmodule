import { Routes } from '@angular/router';
import { EvacuationComponent } from './features/evacuation/evacuation.component';
import { SigninComponent } from './shared/components/Signin/signin.component';
import { SignupComponent } from './shared/components/Signup/signup.component';
import { HomeComponent } from './features/home/home.component';
import { UserComponent } from './features/user/user.component';
import { AdminComponent } from './features/admin/admin.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },

  {
    path: 'evacuation',
    component: EvacuationComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'USER' }
  },

  {
  path: 'admin',
  component: AdminComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { role: 'ADMIN' },
  children: [
    {
      path: '',
      component: AdminDashboardComponent
    }
  ]
}

];
