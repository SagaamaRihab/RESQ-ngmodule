import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token'); // se non avete token, dimmelo

  if (token) return true;

  router.navigate(['/signup']); // oppure '/signin' se la tua pagina login è signin
  return false;
};

