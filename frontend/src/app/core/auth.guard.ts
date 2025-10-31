import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // ako već imamo usera u memoriji, pusti dalje
  if (auth.isLoggedIn()) return true;

  // inače probaj da povučeš /auth/me (cookie sesija)
  return auth.me().pipe(
    map(() => true),
    catchError(() => {
      // preusmjeri na login i zapamti gdje je korisnik krenuo
      return of(
        router.createUrlTree(['/login'], {
          queryParams: { redirect: state.url },
        }),
      );
    }),
  );
};
