import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpensesService } from '../../../core/expenses.service';
import { CategoriesService } from '../../../core/categories.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-expenses-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <!-- Filters -->
      <section class="ui-card p-4">
        <div class="flex flex-col gap-4">
          <!-- Inputs -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label class="block text-sm mb-1">From</label>
              <input
                class="w-full"
                type="date"
                [(ngModel)]="from"
                name="from"
              />
            </div>
            <div>
              <label class="block text-sm mb-1">To</label>
              <input class="w-full" type="date" [(ngModel)]="to" name="to" />
            </div>
            <div>
              <label class="block text-sm mb-1">Sort</label>
              <select class="w-full" [(ngModel)]="sort" name="sort">
                <option value="date">date</option>
                <option value="amount">amount</option>
                <option value="name">name</option>
              </select>
            </div>
            <div>
              <label class="block text-sm mb-1">Order</label>
              <select class="w-full" [(ngModel)]="order" name="order">
                <option value="DESC">DESC</option>
                <option value="ASC">ASC</option>
              </select>
            </div>
          </div>

          <!-- Presets + Actions -->
          <div class="flex flex-wrap items-center justify-between gap-3">
            <!-- Preset segmented buttons -->
            <div
              class="inline-flex rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700"
            >
              <button
                class="px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                (click)="preset('today')"
                title="Filter to today"
              >
                Today
              </button>
              <span class="w-px bg-slate-300/70 dark:bg-slate-700/70"></span>
              <button
                class="px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                (click)="preset('week')"
                title="Filter to this week"
              >
                This week
              </button>
              <span class="w-px bg-slate-300/70 dark:bg-slate-700/70"></span>
              <button
                class="px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                (click)="preset('month')"
                title="Filter to this month"
              >
                This month
              </button>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-2">
              <button
                class="ui-btn"
                (click)="exportCsv()"
                title="Export current results to CSV"
              >
                Export CSV
              </button>
              <button
                class="px-4 py-2 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-500"
                (click)="applyFilters()"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Table -->
      <div class="ui-card overflow-hidden">
        <table class="min-w-full">
          <thead class="ui-card bg-gray-100">
            <tr>
              <th class="text-left p-3">Date</th>
              <th class="text-left p-3">Name</th>
              <th class="text-right p-3">Amount</th>
              <th class="text-left p-3">Category</th>
              <th class="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of rows(); trackBy: trackId">
              <!-- Date -->
              <td class="p-3">{{ e.date | date: 'yyyy-MM-dd' }}</td>

              <!-- Name (editable) -->
              <td class="p-3">
                <ng-container *ngIf="editId !== e.id; else editNameTpl">{{
                  e.name
                }}</ng-container>
                <ng-template #editNameTpl>
                  <input
                    class="border rounded px-2 py-1 w-full"
                    [(ngModel)]="editModel.name"
                  />
                </ng-template>
              </td>

              <!-- Amount (editable) -->
              <td class="p-3 text-right">
                <ng-container *ngIf="editId !== e.id; else editAmountTpl">{{
                  e.amount | currency: 'EUR' : 'symbol' : '1.2-2'
                }}</ng-container>
                <ng-template #editAmountTpl>
                  <input
                    class="border rounded px-2 py-1 w-28 text-right"
                    type="number"
                    step="0.01"
                    [(ngModel)]="editModel.amount"
                  />
                </ng-template>
              </td>

              <!-- Category (color badge + editable select) -->
              <td class="p-3">
                <ng-container *ngIf="editId !== e.id; else editCatTpl">
                  <ng-container *ngIf="e.category; else dash">
                    <span class="inline-flex items-center gap-2">
                      <span
                        class="inline-block w-3 h-3 rounded-full border"
                        [style.background]="e.category.color || '#999'"
                      ></span>
                      {{ e.category.name }}
                    </span>
                  </ng-container>
                  <ng-template #dash>—</ng-template>
                </ng-container>

                <ng-template #editCatTpl>
                  <select
                    class="border rounded px-2 py-1"
                    [(ngModel)]="editModel.category_id"
                  >
                    <option [ngValue]="null">—</option>
                    <option *ngFor="let c of categories()" [ngValue]="c.id">
                      {{ c.name }}
                    </option>
                  </select>
                </ng-template>
              </td>

              <!-- Actions -->
              <td class="p-3 text-right">
                <button
                  class="ui-btn px-3 py-1 rounded border mr-2"
                  *ngIf="editId !== e.id"
                  (click)="startEdit(e)"
                >
                  Edit
                </button>
                <ng-container *ngIf="editId === e.id">
                  <button
                    class="px-3 py-1 rounded bg-green-600 text-white mr-2"
                    (click)="saveEdit()"
                  >
                    Save
                  </button>
                  <button
                    class="ui-btn px-3 py-1 rounded border mr-2"
                    (click)="cancelEdit()"
                  >
                    Cancel
                  </button>
                </ng-container>
                <button
                  class="px-3 py-1 rounded bg-red-600 text-white"
                  (click)="remove(e.id)"
                >
                  Delete
                </button>
              </td>
            </tr>

            <tr *ngIf="!rows().length">
              <td class="p-4 text-center text-gray-500" colspan="5">No data</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class=" flex items-center justify-between py-3">
        <div class="text-sm text-gray-600">
          Page {{ page }} / {{ last_page }} · Total {{ total }}
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm">Per page</label>
          <select
            class="ui-btn border rounded px-2 py-1"
            [ngModel]="per_page"
            (ngModelChange)="setPer($event)"
          >
            <option [ngValue]="5">5</option>
            <option [ngValue]="10">10</option>
            <option [ngValue]="20">20</option>
            <option [ngValue]="50">50</option>
          </select>
          <button
            class="ui-btn px-3 py-1 rounded border"
            (click)="prev()"
            [disabled]="page <= 1"
          >
            Prev
          </button>
          <button
            class="ui-btn px-3 py-1 rounded border"
            (click)="next()"
            [disabled]="page >= last_page"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Create form -->
      <form
        class="ui-card p-4 grid md:grid-cols-5 gap-3 items-end"
        (ngSubmit)="create()"
      >
        <div class="md:col-span-2">
          <label class="block text-sm mb-1">Name</label>
          <input
            class="border rounded px-3 py-2 w-full"
            [(ngModel)]="form.name"
            name="name"
            required
          />
        </div>
        <div>
          <label class="block text-sm mb-1">Amount</label>
          <input
            class="border rounded px-3 py-2 w-full"
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
            class="border rounded px-3 py-2 w-full"
            type="date"
            [(ngModel)]="form.date"
            name="date"
            required
          />
        </div>
        <div>
          <label class="block text-sm mb-1">Category</label>
          <select
            class="border rounded px-3 py-2 w-full"
            [(ngModel)]="form.category_id"
            name="category_id"
          >
            <option [ngValue]="null">—</option>
            <option *ngFor="let c of categories()" [ngValue]="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>
        <div class="md:col-span-5">
          <label class="block text-sm mb-1">Notes</label>
          <input
            class="border rounded px-3 py-2 w-full"
            [(ngModel)]="form.notes"
            name="notes"
          />
        </div>
        <div class="md:col-span-5">
          <button class="px-4 py-2 rounded bg-green-600 text-white">
            Add expense
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ExpensesListComponent implements OnInit {
  rows = signal<any[]>([]);
  categories = signal<any[]>([]);

  // edit state
  editId: number | null = null;
  editModel: any = {};

  // filters
  from = '';
  to = '';
  sort: 'date' | 'amount' | 'name' | 'created_at' = 'date';
  order: 'ASC' | 'DESC' = 'DESC';

  // pagination
  page = 1;
  per_page = 10;
  total = 0;
  last_page = 1;

  // form
  form: any = {
    name: '',
    amount: null,
    date: '',
    notes: '',
    category_id: null,
  };

  constructor(
    private api: ExpensesService,
    private cats: CategoriesService,
  ) {}

  ngOnInit() {
    this.load();
    this.cats.list().subscribe((res: any) => this.categories.set(res));
  }

  trackId = (_: number, row: any) => row.id;

  applyFilters() {
    this.page = 1;
    this.load();
  }

  load() {
    const params: any = {
      sort: this.sort,
      order: this.order,
      page: this.page,
      per_page: this.per_page,
    };
    if (this.from) params.from = this.from;
    if (this.to) params.to = this.to;

    this.api.list(params).subscribe((res: any) => {
      if (Array.isArray(res)) {
        this.rows.set(res);
        this.total = res.length;
        this.last_page = 1;
        this.page = 1;
      } else {
        this.rows.set(res.data || []);
        const meta = res.meta || {};
        this.total = meta.total ?? res.total ?? res.data?.length ?? 0;
        this.last_page = meta.last_page ?? res.last_page ?? 1;
        this.page = meta.current_page ?? res.current_page ?? 1;
      }
    });
  }

  create() {
    const dto = { ...this.form };
    this.api.create(dto).subscribe(() => {
      this.form = {
        name: '',
        amount: null,
        date: '',
        notes: '',
        category_id: null,
      };
      this.page = 1;
      this.load();
    });
  }

  remove(id: number) {
    this.api.remove(id).subscribe(() => this.load());
  }

  // pagination helpers
  prev() {
    if (this.page > 1) {
      this.page--;
      this.load();
    }
  }
  next() {
    if (this.page < this.last_page) {
      this.page++;
      this.load();
    }
  }
  setPer(n: number) {
    this.per_page = +n;
    this.page = 1;
    this.load();
  }

  // edit helpers
  startEdit(e: any) {
    this.editId = e.id;
    this.editModel = {
      name: e.name,
      amount: e.amount,
      date: e.date,
      notes: e.notes,
      category_id: e.category_id ?? e.category?.id ?? null,
    };
  }
  cancelEdit() {
    this.editId = null;
    this.editModel = {};
  }
  saveEdit() {
    if (this.editId == null) return;
    this.api.update(this.editId, this.editModel).subscribe(() => {
      this.editId = null;
      this.editModel = {};
      this.load();
    });
  }
  async exportCsv() {
    // 1) pokupi SVE rezultate prema trenutno aktivnim filterima (bez paginacije)
    const all = await this.fetchAllFiltered();

    // 2) sastavi CSV
    const header = ['date', 'name', 'amount', 'category', 'notes'];
    const lines = [header.join(',')];

    for (const e of all) {
      const row = [
        this.csv(e.date),
        this.csv(e.name),
        this.csv(e.amount),
        this.csv(e.category?.name ?? ''),
        this.csv(e.notes ?? ''),
      ];
      lines.push(row.join(','));
    }

    const blob = new Blob([lines.join('\r\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const d = new Date();
    a.download = `expenses_${d.getFullYear()}-${(d.getMonth() + 1 + '').padStart(2, '0')}-${(d.getDate() + '').padStart(2, '0')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private csv(v: any) {
    // escape CSV (", newlines)
    if (v === null || v === undefined) return '""';
    const s = String(v);
    const escaped = s.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  private async fetchAllFiltered(): Promise<any[]> {
    const paramsBase: any = {
      sort: this.sort,
      order: this.order,
      // tražimo velike stranice da smanjimo broj upita;
      // ako backend ograniči per_page, petlja će svejedno proći kroz stranice.
      per_page: 500,
      page: 1,
    };
    if (this.from) paramsBase.from = this.from;
    if (this.to) paramsBase.to = this.to;

    let page = 1,
      last = 1;
    const acc: any[] = [];
    do {
      const res: any = await lastValueFrom(
        this.api.list({ ...paramsBase, page }),
      );
      const data = Array.isArray(res) ? res : (res.data ?? []);
      acc.push(...data);
      if (Array.isArray(res)) break;
      last = res.meta?.last_page ?? res.last_page ?? page;
      page++;
    } while (page <= last);

    return acc;
  }
  preset(which: 'today' | 'week' | 'month') {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const iso = (x: Date) =>
      `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;

    if (which === 'today') {
      const t = iso(d);
      this.from = t;
      this.to = t;
    } else if (which === 'week') {
      const day = d.getDay(); // 0=Sun
      const diff = day === 0 ? 6 : day - 1; // start Monday
      const start = new Date(d);
      start.setDate(d.getDate() - diff);
      this.from = iso(start);
      this.to = iso(d);
    } else {
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      this.from = iso(start);
      this.to = iso(d);
    }
    this.applyFilters();
  }
}
