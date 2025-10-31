import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private api: ApiService) {}

  list(): Observable<any[]> {
    return this.api.get<any[]>('/categories');
  }
  create(dto: any) {
    return this.api.post('/categories', dto);
  }
  update(id: number, dto: any) {
    return this.api.put(`/categories/${id}`, dto);
  }
  remove(id: number) {
    return this.api.delete(`/categories/${id}`);
  }
}
