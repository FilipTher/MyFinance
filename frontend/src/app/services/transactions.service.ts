import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Transaction {
  id?: number;
  amount: number;
  description: string;
  date: string;
  category: any;
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
    const userId = this.authService.getUserId();
    const transactionWithUserId = { ...transaction, userId };
    return this.http.post<Transaction>(this.apiUrl, transactionWithUserId);
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteTransactions(ids: number[]): Observable<any> {
    const deleteRequests = ids.map(id => this.deleteTransaction(id));
    return new Observable(observer => {
      let completed = 0;
      let hasError = false;

      if (deleteRequests.length === 0) {
        observer.next([]);
        observer.complete();
        return;
      }

      deleteRequests.forEach(req => {
        req.subscribe({
          next: () => {
            completed++;
            if (completed === deleteRequests.length) {
              observer.next({ deleted: completed });
              observer.complete();
            }
          },
          error: (err) => {
            if (!hasError) {
              hasError = true;
              observer.error(err);
            }
          }
        });
      });
    });
  }

  updateTransaction(id: number, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/${id}`, transaction);
  }
}
