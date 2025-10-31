// src/app/core/auth.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  user = signal<any | null>(null);

  register(dto: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) {
    return this.api.post('/auth/register', dto);
  }

  login(email: string, password: string) {
    return this.api.post('/auth/login', { email, password }).pipe(
      switchMap(() => this.me()), // <-- nakon logina, učitaj user-a
    );
  }

  me() {
    return this.api.get<any>('/auth/me').pipe(
      map((res) => {
        const u = res?.data ?? res?.user ?? res ?? null;
        if (!u) return null;

        // Normalizacija imena
        const first = u.first_name ?? u.firstName ?? null;
        const last = u.last_name ?? u.lastName ?? null;
        let name = u.name ?? [first, last].filter(Boolean).join(' ').trim();

        // Ako i dalje nemamo first/last, pokušaj parsirati iz "name"
        let first_name = first,
          last_name = last;
        if ((!first_name || !last_name) && name) {
          const parts = String(name).trim().split(/\s+/);
          first_name = first_name ?? parts[0] ?? '';
          last_name = last_name ?? parts.slice(1).join(' ') ?? '';
        }

        return {
          id: u.id,
          email: u.email ?? '',
          name,
          first_name,
          last_name,
          ...u, // zadrži sve ostalo što backend šalje
        };
      }),
      tap((u) => this.user.set(u)),
    );
  }

  logout() {
    return this.api
      .post('/auth/logout', {})
      .pipe(tap(() => this.user.set(null)));
  }

  isLoggedIn() {
    return !!this.user();
  }
}
