import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpensesService } from '../../core/expenses.service';
import { CategoriesService } from '../../core/categories.service';

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

@Component({
  selector: 'app-quick-add-expense',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating + button -->
    <button
      class="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 ui-btn ui-btn-primary shadow-soft text-2xl"
      (click)="openForm()"
      aria-label="Quick add expense"
      title="Quick add expense"
    >
      +
    </button>

    <!-- Overlay + Modal -->
    <div *ngIf="open()" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" (click)="close()"></div>

      <!-- Dialog -->
      <div
        class="absolute inset-x-4 sm:inset-x-auto sm:right-8 top-1/2 -translate-y-1/2 sm:w-[420px] ui-card p-5"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold">Add expense</h3>
          <button class="ui-btn px-3 py-1" (click)="close()">✕</button>
        </div>

        <form class="grid gap-3" (ngSubmit)="submit()">
          <div>
            <label class="block text-sm mb-1">Name</label>
            <input
              class="w-full"
              [(ngModel)]="form.name"
              name="name"
              required
              autofocus
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm mb-1">Amount</label>
              <input
                class="w-full text-right"
                type="number"
                step="0.01"
                [(ngModel)]="form.amount"
                name="amount"
                required
              />
            </div>
            <div>
              <label class="block text-sm mb-1">Date</label>
              <input
                class="w-full"
                type="date"
                [(ngModel)]="form.date"
                name="date"
                required
              />
            </div>
          </div>
          <div>
            <label class="block text-sm mb-1">Category</label>
            <select
              class="w-full"
              [(ngModel)]="form.category_id"
              name="category_id"
            >
              <option [ngValue]="null">—</option>
              <option *ngFor="let c of categories()" [ngValue]="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm mb-1">Notes</label>
            <input class="w-full" [(ngModel)]="form.notes" name="notes" />
          </div>

          <p class="text-red-500 text-sm" *ngIf="error()">{{ error() }}</p>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="ui-btn" (click)="close()">
              Cancel
            </button>
            <button class="ui-btn ui-btn-primary" [disabled]="loading()">
              {{ loading() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class QuickAddExpenseComponent implements OnInit {
  private expenses = inject(ExpensesService);
  private catsSrv = inject(CategoriesService);

  @Output() created = new EventEmitter<any>();

  open = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  categories = signal<any[]>([]);

  form: any = {
    name: '',
    amount: null,
    date: todayISO(),
    notes: '',
    category_id: null,
  };

  ngOnInit() {
    this.catsSrv.list().subscribe((res: any) => this.categories.set(res || []));
    // ESC to close
    window.addEventListener('keydown', this.keyHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.keyHandler);
  }

  keyHandler = (e: KeyboardEvent) => {
    if (this.open() && e.key === 'Escape') this.close();
  };

  openForm() {
    this.error.set(null);
    this.open.set(true);
    document.documentElement.style.overflow = 'hidden';
  }

  close() {
    this.open.set(false);
    document.documentElement.style.overflow = '';
    this.resetForm();
  }

  resetForm() {
    this.form = {
      name: '',
      amount: null,
      date: todayISO(),
      notes: '',
      category_id: null,
    };
    this.loading.set(false);
    this.error.set(null);
  }

  submit() {
    if (!this.form.name || !this.form.amount || !this.form.date) return;
    this.loading.set(true);
    this.error.set(null);
    this.expenses.create(this.form).subscribe({
      next: (r) => {
        this.created.emit(r);
        this.close();
      },
      error: (e) => {
        this.error.set(e?.error?.message || 'Failed to add expense');
        this.loading.set(false);
      },
    });
  }
}
