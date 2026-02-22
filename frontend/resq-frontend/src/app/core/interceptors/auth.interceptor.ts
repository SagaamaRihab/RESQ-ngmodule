import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  //  Se non c'è token → vai avanti senza modificare
  if (!token) {
    return next(req);
  }

  //  Non mettere token su login/signup
  const isAuthRequest =
    req.url.includes('/auth/signin') ||
    req.url.includes('/auth/signup');

  if (!isAuthRequest) {

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  }

  return next(req);
};
