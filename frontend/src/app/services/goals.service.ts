import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Goal {
  id?: number;
  name: string;
  categoryName: string;
  icon: string;
  targetAmount: number;
  savedAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class GoalsService {
  private apiUrl = 'http://localhost:3000/goals';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getGoals(): Observable<Goal[]> {
    const userId = this.authService.getUserId();
    const url = userId ? `${this.apiUrl}?userId=${userId}` : this.apiUrl;
    return this.http.get<Goal[]>(url);
  }

  createGoal(goal: Goal): Observable<Goal> {
    return this.http.post<Goal>(this.apiUrl, goal);
  }

  updateGoal(id: number, goal: Partial<Goal>): Observable<Goal> {
    return this.http.patch<Goal>(`${this.apiUrl}/${id}`, goal);
  }

  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
