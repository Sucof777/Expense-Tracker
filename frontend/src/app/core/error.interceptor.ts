// src/app/core/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // 401 → nazad na login
      if (err.status === 401) router.navigateByUrl('/login');

      // VAŽNO: prosledi grešku dalje, da tvoj subscribe(error) radi normalno
      return throwError(() => err);
    }),
  );
};
