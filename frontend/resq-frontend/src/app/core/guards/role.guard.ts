import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const userRole = localStorage.getItem('role');
    const requiredRole = route.data['role'];

    console.log('ROLE GUARD → userRole:', userRole);
    console.log('ROLE GUARD → requiredRole:', requiredRole);

    if (!userRole) {
      this.router.navigate(['/signin']);
      return false;
    }

    if (userRole === requiredRole) {
      return true;
    }

    this.router.navigate(['/signin']);
    return false;
  }
}
