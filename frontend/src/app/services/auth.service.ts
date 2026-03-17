import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/users'; 

  public isLoggedIn$ = new BehaviorSubject<boolean>(!!localStorage.getItem('myfinance_token'));
  public currentUserName = localStorage.getItem('myfinance_user_name') || 'Uživatel';
  public currentUserId = localStorage.getItem('myfinance_user_id') ? parseInt(localStorage.getItem('myfinance_user_id')!) : null;

  constructor(private http: HttpClient) { }

  register(userData: any) {
    return this.http.post(this.apiUrl, userData);
  }

  login(userData: any) {
    return this.http.post(`${this.apiUrl}/login`, userData);
  }

  loginSuccess(emailOrName: string, userId?: number) {
    localStorage.setItem('myfinance_token', 'tajny-token-123');
    localStorage.setItem('myfinance_user_name', emailOrName);
    if (userId) {
      localStorage.setItem('myfinance_user_id', userId.toString());
      this.currentUserId = userId;
    }
    this.currentUserName = emailOrName;
    this.isLoggedIn$.next(true);
  }

  logout() {
    localStorage.removeItem('myfinance_token');
    localStorage.removeItem('myfinance_user_name');
    localStorage.removeItem('myfinance_user_id');
    this.currentUserId = null;
    this.isLoggedIn$.next(false);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('myfinance_token');
  }

  getUserId(): number | null {
    const id = localStorage.getItem('myfinance_user_id');
    return id ? parseInt(id) : null;
  }
}