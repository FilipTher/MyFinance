import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Transaction {
  id?: number;
  amount: number;
  description: string;
  date: string;
  category: string;
  type: 'expense' | 'income';
}

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private apiUrl = 'http://localhost:3000/transactions';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getTransactions(): Observable<Transaction[]> {
    const userId = this.authService.getUserId();
    const url = userId ? `${this.apiUrl}?userId=${userId}` : this.apiUrl;
    return this.http.get<Transaction[]>(url);
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }
}
