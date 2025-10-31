import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  constructor(private api: ApiService) {}

  list(params?: any): Observable<any> {
    return this.api.get<any>('/expenses', params); // paginated ili array
  }
  create(dto: any) {
    return this.api.post('/expenses', dto);
  }
  update(id: number, dto: any) {
    return this.api.put(`/expenses/${id}`, dto);
  }
  remove(id: number) {
    return this.api.delete(`/expenses/${id}`);
  }
}
