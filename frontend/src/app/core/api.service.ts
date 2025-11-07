import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.prod.apiUrl;
  constructor(private http: HttpClient) {}

  get<T = any>(u: string, params?: any) {
    return this.http.get<T>(`${this.base}${u}`, { params });
  }
  post<T = any>(u: string, body: any) {
    return this.http.post<T>(`${this.base}${u}`, body);
  }
  put<T = any>(u: string, body: any) {
    return this.http.put<T>(`${this.base}${u}`, body);
  }
  delete<T = any>(u: string) {
    return this.http.delete<T>(`${this.base}${u}`);
  }
}
