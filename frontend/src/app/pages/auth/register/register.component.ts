import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center">
      <form
        class="ui-card  p-8 rounded-2xl shadow w-full max-w-sm space-y-3"
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
      >
        <h1 class="text-xl font-semibold">Register</h1>
        <input
          class="w-full border rounded px-3 py-2"
          placeholder="First name"
          formControlName="first_name"
        />
        <input
          class="w-full border rounded px-3 py-2"
          placeholder="Last name"
          formControlName="last_name"
        />
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
          {{ loading() ? 'Loading...' : 'Create account' }}
        </button>
        <p class="text-sm text-red-600" *ngIf="error()">{{ error() }}</p>
        <p class="ui-btn text-sm">
          Imaš nalog?
          <a routerLink="/login" class="ui-btn ">Prijavi se</a>
        </p>
      </form>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | undefined>(undefined);

  form = this.fb.nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(undefined);
    const dto = this.form.getRawValue();
    this.auth.register(dto).subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: (e) => {
        this.error.set(e?.error?.message || 'Register failed');
        this.loading.set(false);
      },
    });
  }
}
