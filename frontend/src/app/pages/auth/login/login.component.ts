import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center">
      <form
        class="ui-card p-8 rounded-2xl shadow w-full max-w-sm space-y-4"
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
      >
        <h1 class="text-xl font-semibold">Sign in</h1>
        <input
          class="w-full border rounded px-3 py-2"
          placeholder="Email"
          formControlName="email"
        />
        <input
          class="w-full border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          formControlName="password"
        />
        <button
          class="w-full py-2 rounded bg-black text-white"
          [disabled]="form.invalid || loading()"
        >
          {{ loading() ? 'Loading...' : 'Sign in' }}
        </button>
        <p class="text-sm text-red-600" *ngIf="error()">{{ error() }}</p>
        <p class="ui-btn text-sm">
          Nemaš nalog?
          <a routerLink="/register" class="ui-btn ">Register</a>
        </p>
      </form>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | undefined>(undefined);

  // sada je fb sigurno inicijalizovan prije ovoga
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(undefined);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (e) => {
        this.error.set(e?.error?.message || 'Login failed');
        this.loading.set(false);
      },
    });
  }
}
