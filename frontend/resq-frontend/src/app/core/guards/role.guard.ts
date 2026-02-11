import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.checkRole(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot): boolean {
    return this.checkRole(route);
  }

  private checkRole(route: ActivatedRouteSnapshot): boolean {

    const userRole = localStorage.getItem('role');
    const allowedRoles = route.data['roles'] as string[];

    console.log('ROLE:', userRole);
    console.log('ALLOWED:', allowedRoles);

    if (!allowedRoles) {
       return true; // eredita dal padre
    }

    if (userRole && allowedRoles.includes(userRole)) {
        return true;
    }


    this.router.navigate(['/signin']);
    return false;
  }
}
