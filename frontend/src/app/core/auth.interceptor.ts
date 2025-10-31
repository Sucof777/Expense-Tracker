import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) =>
  next(
    req.clone({
      withCredentials: true,
      setHeaders: { Accept: 'application/json' },
    }),
  );
