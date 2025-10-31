import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesService } from '../../../core/categories.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold">Categories</h1>

      <!-- Add -->
      <form
        class="ui-card p-4 grid md:grid-cols-3 gap-3 items-end"
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
          <label class="block text-sm mb-1">Color (optional)</label>
          <input
            class="border rounded px-3 py-2 w-full"
            [(ngModel)]="form.color"
            name="color"
            placeholder="#888888"
          />
        </div>
        <div>
          <label class="block text-sm mb-1">Budget (monthly)</label>
          <input
            class="border rounded px-3 py-2 w-full"
            type="number"
            min="0"
            step="0.01"
            [(ngModel)]="form.budget"
            name="budget"
            placeholder="e.g. 200.00"
          />
        </div>

        <div class="md:col-span-3">
          <button class="px-4 py-2 rounded bg-green-600 text-white">
            Add category
          </button>
        </div>
      </form>

      <!-- List -->
      <div class="ui-card overflow-hidden">
        <table class="min-w-full">
          <thead class="ui-card bg-gray-100">
            <tr>
              <th class="text-left p-3">Name</th>
              <th class="text-left p-3">Color</th>
              <th class="text-left p-3">Budget</th>
              <th class="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of rows()">
              <td class="p-3">
                <input
                  class="border rounded px-2 py-1 w-full"
                  [(ngModel)]="c.editName"
                  name="name-{{ c.id }}"
                />
              </td>
              <td class="p-3">
                <input
                  class="border rounded px-2 py-1 w-full"
                  [(ngModel)]="c.editColor"
                  name="color-{{ c.id }}"
                />
              </td>
              <td class="p-3">
                <input
                  class="border rounded px-2 py-1 w-full text-right"
                  type="number"
                  min="0"
                  step="0.01"
                  [(ngModel)]="c.editBudget"
                  name="budget-{{ c.id }}"
                  placeholder="e.g. 200"
                />
              </td>
              <td class="p-3 text-right space-x-2">
                <button
                  class="px-3 py-1 rounded bg-blue-600 text-white"
                  (click)="update(c)"
                >
                  Save
                </button>
                <button
                  class="px-3 py-1 rounded bg-red-600 text-white"
                  (click)="remove(c.id)"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr *ngIf="!rows().length">
              <td class="p-4 text-center text-gray-500" colspan="4">
                No categories
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class CategoriesComponent implements OnInit {
  rows = signal<any[]>([]);
  form = { name: '', color: '', budget: null as number | null };

  constructor(private cats: CategoriesService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.cats.list().subscribe((res: any[]) => {
      this.rows.set(
        (res || []).map((c) => ({
          ...c,
          editName: c.name,
          editColor: c.color || '',
          editBudget: this.toBudgetModel(c.budget),
        })),
      );
    });
  }

  create() {
    const dto: any = { name: this.form.name };
    if (this.form.color) dto.color = this.form.color;
    const budget = this.normalizeBudgetInput(this.form.budget);
    if (budget !== undefined && budget !== null) {
      dto.budget = budget;
    }
    this.cats.create(dto).subscribe(() => {
      this.form = { name: '', color: '', budget: null as number | null };
      this.load();
    });
  }

  update(row: any) {
    const dto: any = { name: row.editName };
    if (row.editColor !== undefined) dto.color = row.editColor;
    const budget = this.normalizeBudgetInput(row.editBudget);
    if (budget !== undefined) {
      dto.budget = budget;
    }
    this.cats.update(row.id, dto).subscribe(() => this.load());
  }

  remove(id: number) {
    this.cats.remove(id).subscribe(() => this.load());
  }

  private toBudgetModel(raw: any): number | null {
    if (raw === null || raw === undefined || raw === '') {
      return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }

  private normalizeBudgetInput(value: any): number | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === null || value === '') {
      return null;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return undefined;
    }
    return parsed;
  }
}
