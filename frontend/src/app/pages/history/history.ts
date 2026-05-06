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
    castkaMin: 0,
    castkaMax: 100000,
    datumOd: '',
    datumDo: ''
  };

  allTransactions: any[] = [];
  filteredTransactions: any[] = [];
  categories: Category[] = [];
  private destroy$ = new Subject<void>();

  editModalOpen = false;
  editingTransaction: any = null;
  editFormData: any = {};

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
          this.allTransactions = [];
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
    this.categoriesService.getCategories('transaction')
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
          this.allTransactions = data.map(t => {
            const categoryName = (t.category as any)?.name || 'Nezařazeno';
            return {
              id: t.id,
              vybrano: false,
              nazev: categoryName,
              castka: t.type === 'income' ? parseInt(t.amount as any) : -parseInt(t.amount as any),
              typ: t.type === 'income' ? 'prijem' : 'vydaj',
              datum: t.date,
              datumFormatovano: new Date(t.date).toLocaleDateString('cs-CZ'),
              popis: t.description || '-',
              ikona: 'attach_money',
              barva: t.type === 'income' ? 'green' : 'red'
            };
          });
          
          // Set default date range based on all transactions
          if (this.allTransactions.length > 0) {
            // Get all dates from transactions
            const dates = this.allTransactions.map(t => new Date(t.datum));
            const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
            const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
            
            // Format dates for input fields (YYYY-MM-DD)
            this.filtry.datumOd = earliestDate.toISOString().split('T')[0];
            this.filtry.datumDo = latestDate.toISOString().split('T')[0];
          } else {
            // If no transactions, set today as default
            const today = new Date();
            this.filtry.datumDo = today.toISOString().split('T')[0];
            this.filtry.datumOd = today.toISOString().split('T')[0];
          }
          
          this.applyFilters();
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Chyba při načítání transakcí:', err);
          this.allTransactions = [];
          this.cd.markForCheck();
        }
      });
  }

  applyFilters() {
    this.filteredTransactions = this.allTransactions.filter(t => {
      // Search filter
      if (this.filtry.hledat && !t.popis.toLowerCase().includes(this.filtry.hledat.toLowerCase()) &&
          !t.nazev.toLowerCase().includes(this.filtry.hledat.toLowerCase())) {
        return false;
      }

      // Type filter
      if (this.filtry.typ !== 'vse' && t.typ !== this.filtry.typ) {
        return false;
      }

      // Category filter
      if (this.filtry.kategorie !== 'vse' && t.nazev !== this.filtry.kategorie) {
        return false;
      }

      // Amount range filter
      const absoluteAmount = Math.abs(t.castka);
      if (absoluteAmount < this.filtry.castkaMin || absoluteAmount > this.filtry.castkaMax) {
        return false;
      }

      // Date range filter
      if (this.filtry.datumOd || this.filtry.datumDo) {
        const transactionDate = new Date(t.datum);
        
        if (this.filtry.datumOd) {
          const dateFrom = new Date(this.filtry.datumOd);
          if (transactionDate < dateFrom) return false;
        }
        
        if (this.filtry.datumDo) {
          const dateTo = new Date(this.filtry.datumDo);
          dateTo.setHours(23, 59, 59, 999);
          if (transactionDate > dateTo) return false;
        }
      }

      return true;
    });
  }

  getSelectedCount(): number {
    return this.filteredTransactions.filter(t => t.vybrano).length;
  }

  isEditEnabled(): boolean {
    return this.getSelectedCount() === 1;
  }

  isDeleteEnabled(): boolean {
    return this.getSelectedCount() >= 1;
  }

  deleteSelected() {
    const selectedTransactions = this.filteredTransactions.filter(t => t.vybrano);
    
    if (selectedTransactions.length === 0) {
      return;
    }

    const count = selectedTransactions.length;
    const message = count === 1 
      ? 'Opravdu chcete smazat vybranou transakci?' 
      : `Opravdu chcete smazat ${count} vybraných transakcí?`;

    if (confirm(message)) {
      const ids = selectedTransactions.map(t => t.id);
      
      this.transactionsService.deleteTransactions(ids)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Remove deleted transactions from the list
            this.allTransactions = this.allTransactions.filter(
              t => !ids.includes(t.id)
            );
            this.applyFilters();
            this.cd.markForCheck();
          },
          error: (err) => {
            console.error('Chyba při mazání transakcí:', err);
            alert('Chyba při mazání transakcí. Zkuste to prosím později.');
          }
        });
    }
  }

  editSelected() {
    const selectedTransactions = this.filteredTransactions.filter(t => t.vybrano);
    
    if (selectedTransactions.length !== 1) {
      return;
    }

    this.editingTransaction = selectedTransactions[0];
    const originalTransaction = this.allTransactions.find(t => t.id === selectedTransactions[0].id);
    
    this.editFormData = {
      amount: Math.abs(this.editingTransaction.castka),
      description: this.editingTransaction.popis,
      date: this.editingTransaction.datum,
      category: originalTransaction?.categoryId || '',
      type: this.editingTransaction.typ === 'prijem' ? 'income' : 'expense'
    };
    
    this.editModalOpen = true;
  }

  closeEditModal() {
    this.editModalOpen = false;
    this.editingTransaction = null;
    this.editFormData = {};
  }

  saveEditedTransaction() {
    if (!this.editingTransaction || !this.editFormData.category) {
      alert('Prosím vyberte kategorii');
      return;
    }

    const updateData = {
      amount: this.editFormData.amount,
      description: this.editFormData.description,
      date: this.editFormData.date,
      category: this.editFormData.category,
      type: this.editFormData.type
    };

    this.transactionsService.updateTransaction(this.editingTransaction.id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update the transaction in the list
          const index = this.allTransactions.findIndex(t => t.id === this.editingTransaction.id);
          if (index !== -1) {
            const categoryName = this.categories.find(c => c.id === this.editFormData.category)?.name || 'Nezařazeno';
            this.allTransactions[index] = {
              ...this.allTransactions[index],
              nazev: categoryName,
              castka: this.editFormData.type === 'income' ? this.editFormData.amount : -this.editFormData.amount,
              typ: this.editFormData.type === 'income' ? 'prijem' : 'vydaj',
              datum: this.editFormData.date,
              datumFormatovano: new Date(this.editFormData.date).toLocaleDateString('cs-CZ'),
              popis: this.editFormData.description || '-',
              categoryId: this.editFormData.category
            };
          }
          this.applyFilters();
          this.closeEditModal();
          alert('Transakce byla úspěšně aktualizována.');
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Chyba při aktualizaci transakce:', err);
          alert('Chyba při aktualizaci transakce. Zkuste to prosím později.');
        }
      });
  }
}