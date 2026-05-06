import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Category {
  id?: number;
  name: string;
  type: string;
  categoryFor?: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private apiUrl = 'http://localhost:3000/categories';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getCategories(categoryFor: string = 'transaction'): Observable<Category[]> {
    const userId = this.authService.getUserId();
    const url = userId 
      ? `${this.apiUrl}?userId=${userId}&categoryFor=${categoryFor}` 
      : `${this.apiUrl}?categoryFor=${categoryFor}`;
    return this.http.get<Category[]>(url);
  }

  createCategory(category: Omit<Category, 'id'>): Observable<Category> {
    const userId = this.authService.getUserId();
    const categoryWithUserId = { ...category, userId };
    return this.http.post<Category>(this.apiUrl, categoryWithUserId);
  }

  updateCategory(id: number, category: Omit<Category, 'id'>): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
