import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-6xl mx-auto space-y-6">
      <section class="ui-card p-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Welcome back 👋</h1>
          <p class="text-slate-600 dark:text-slate-300 mt-1">
            Track your expenses with style.
          </p>
        </div>
        <a routerLink="/expenses" class="ui-btn ui-btn-primary">Add expense</a>
      </section>

      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <div class="ui-btn flex gap-2">
          <a routerLink="/expenses" class="ui-btn">Expenses</a>
          <a routerLink="/categories" class="ui-btn ">Categories</a>
          <button class="ui-btn" (click)="logout()">Logout</button>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="ui-card p-4">
          <h2 class="font-semibold mb-2">This month</h2>

          <div class="text-3xl font-bold">
            {{ summary()?.total || 0 | currency: 'EUR' : 'symbol' : '1.2-2' }}
          </div>
          <ul class="mt-3 space-y-1">
            <li
              *ngFor="let r of summary()?.byCategory"
              class="flex items-center justify-between"
            >
              <span class="inline-flex items-center gap-2">
                <span
                  class="inline-block w-3 h-3 rounded-full border"
                  [style.background]="r.category?.color || '#999'"
                ></span>
                {{ r.category?.name || '—' }}
              </span>
              <span>{{ r.total | currency: 'EUR' : 'symbol' : '1.2-2' }}</span>
            </li>
          </ul>
        </div>

        <div class="ui-card p-4">
          <h2 class="font-semibold mb-2">Budget alerts</h2>
          <ng-container *ngIf="over().length; else okTpl">
            <ul class="space-y-2">
              <li
                *ngFor="let b of over()"
                class="flex items-center justify-between"
              >
                <span class="inline-flex items-center gap-2">
                  <span
                    class="inline-block w-3 h-3 rounded-full border"
                    [style.background]="b.color || '#f43f5e'"
                  ></span>
                  {{ b.name }}
                </span>
                <span class="font-medium text-red-600">
                  {{ b.total | currency: 'EUR' }} /
                  {{ b.budget | currency: 'EUR' }}
                </span>
              </li>
            </ul>
          </ng-container>
          <ng-template #okTpl>
            <p class="text-slate-500">No budgets exceeded this month.</p>
          </ng-template>
        </div>

        <div class="ui-card p-4">
          <h2 class="font-semibold mb-2">User</h2>
          <div>
            <span class="text-slate-500">Name:</span>
            {{
              (
                me()?.name ||
                (me()?.first_name || '') + ' ' + (me()?.last_name || '')
              )?.trim() || '—'
            }}
          </div>
          <div>
            <span class="text-slate-500">Email:</span> {{ me()?.email }}
          </div>
          <!-- <pre
            class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded mt-3 text-xs"
            >{{ me() | json }}</pre
          > -->
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  me = signal<any>(null);
  summary = signal<any | null>(null);
  categories = signal<any[]>([]);
  over = signal<
    { name: string; color?: string; total: number; budget: number }[]
  >([]);

  constructor() {
    this.auth.me().subscribe((u) => this.me.set(u));
    const now = new Date();
    this.api
      .get('/stats/summary', {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      })
      .subscribe((s) => {
        this.summary.set(s);
        this.recalcOver();
      });
    this.api.get<any[]>('/categories').subscribe((c) => {
      this.categories.set(c || []);
      this.recalcOver();
    });
  }

  private recalcOver() {
    const cats = this.categories();
    const byCat: Record<number, number> = {};
    for (const r of this.summary()?.byCategory || []) {
      if (r.category?.id) byCat[r.category.id] = r.total;
    }
    const over: any[] = [];
    for (const c of cats) {
      if (c.budget != null && byCat[c.id] != null && byCat[c.id] > c.budget) {
        over.push({
          name: c.name,
          color: c.color,
          total: byCat[c.id],
          budget: c.budget,
        });
      }
    }
    this.over.set(over);
  }

  logout() {
    this.auth.logout().subscribe(() => (location.href = '/login'));
  }
}
