import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { CategoriesService, Category } from '../../services/categories.service';
import { TransactionsService, Transaction } from '../../services/transactions.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History implements OnInit, OnDestroy {
  filtry = {
    hledat: '',
    typ: 'vse',
    kategorie: 'vse',
    typZaznamu: 'vse',
    castka: 0
  };

  transakce: any[] = [];
  categories: Category[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private transactionsService: TransactionsService,
    private categoriesService: CategoriesService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Load data if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.loadData();
    }

    // Subscribe to login state changes
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn) => {
        if (isLoggedIn) {
          this.loadData();
        } else {
          // Clear data when logging out
          this.transakce = [];
          this.categories = [];
          this.cd.markForCheck();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoriesService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Category[]) => {
          this.categories = data;
          this.loadTransactions();
        },
        error: (err) => {
          console.error('Chyba při načítání kategorií:', err);
          this.categories = [];
        }
      });
  }

  loadTransactions() {
    this.transactionsService.getTransactions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Transaction[]) => {
          this.transakce = data.map(t => {
            const categoryId = typeof t.category === 'string' ? parseInt(t.category) : t.category;
            const categoryName = this.categories.find(c => c.id === categoryId)?.name || 'Nezařazeno';
            return {
              vybrano: false,
              nazev: categoryName,
              castka: t.type === 'income' ? parseInt(t.amount as any) : -parseInt(t.amount as any),
              datum: new Date(t.date).toLocaleDateString('cs-CZ'),
              popis: t.description || '-',
              ikona: 'attach_money',
              barva: t.type === 'income' ? 'green' : 'red'
            };
          });
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Chyba při načítání transakcí:', err);
          this.transakce = [];
          this.cd.markForCheck();
        }
      });
  }
}