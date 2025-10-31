import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header
      class="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-900/60 border-b border-slate-200/70 dark:border-slate-800"
    >
      <div
        class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between"
      >
        <div class="flex items-center gap-6">
          <a
            routerLink="/"
            class="font-semibold tracking-tight text-slate-800 dark:text-slate-100"
          >
            <span
              class="inline-block w-2 h-2 rounded-full bg-brand-500 mr-2"
            ></span>
            Expense Tracker
          </a>
          <nav class="hidden sm:flex items-center gap-4 text-sm">
            <a
              routerLink="/dashboard"
              routerLinkActive="text-brand-600 dark:text-brand-400"
              class="hover:text-brand-600 dark:hover:text-brand-400"
              >Dashboard</a
            >
            <a
              routerLink="/expenses"
              routerLinkActive="text-brand-600 dark:text-brand-400"
              class="hover:text-brand-600 dark:hover:text-brand-400"
              >Expenses</a
            >
            <a
              routerLink="/categories"
              routerLinkActive="text-brand-600 dark:text-brand-400"
              class="hover:text-brand-600 dark:hover:text-brand-400"
              >Categories</a
            >
          </nav>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="ui-btn"
            (click)="toggleTheme()"
            [attr.aria-label]="'Toggle theme'"
          >
            <span *ngIf="theme() === 'light'">🌙</span>
            <span *ngIf="theme() === 'dark'">☀️</span>
            <span class="hidden sm:inline">{{
              theme() === 'dark' ? 'Light' : 'Dark'
            }}</span>
          </button>
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  theme = signal<'light' | 'dark'>('light');

  constructor() {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    const t = saved ?? (prefersDark ? 'dark' : 'light');
    this.setTheme(t);
  }

  toggleTheme() {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private setTheme(t: 'light' | 'dark') {
    this.theme.set(t);
    const root = document.documentElement;
    root.classList.toggle('dark', t === 'dark');
    localStorage.setItem('theme', t);
  }
}
