import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { CategoriesService, Category } from '../../services/categories.service';
import { TransactionsService, Transaction } from '../../services/transactions.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

  showModal = false;
  activeTab: 'login' | 'register' = 'login';
  showAddRecordModal = false;

  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    email: '',
    password: '',
    passwordConfirm: ''
  };

  recordData = {
    amount: '',
    description: '',
    date: '',
    category: '',
    type: 'expense'
  };

  categories: Category[] = [];

  transakce: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(public authService: AuthService, private categoriesService: CategoriesService, private transactionsService: TransactionsService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.loadCategories();
    }

    // Subscribe to login state changes
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn) => {
        if (isLoggedIn) {
          this.loadCategories();
        } else {
          // Clear data when logging out
          this.categories = [];
          this.transakce = [];
          this.cd.markForCheck();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        this.cd.markForCheck();
        this.loadTransactions();
      },
      error: (err) => {
        console.error('Chyba při načítání kategorií:', err);
        this.categories = [];
        this.cd.markForCheck();
      }
    });
  }

  loadTransactions() {
    this.transactionsService.getTransactions().subscribe({
      next: (data: Transaction[]) => {
        this.transakce = data.map(t => {
          const categoryId = typeof t.category === 'string' ? parseInt(t.category) : t.category;
          const categoryName = this.categories.find(c => c.id === categoryId)?.name || 'Nezařazeno';
          return {
            nazev: categoryName,
            castka: t.type === 'income' ? parseInt(t.amount as any) : -parseInt(t.amount as any),
            datum: t.date,
            popis: t.description,
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

  openModal(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  openAddRecordModal() {
    this.showAddRecordModal = true;
  }

  closeAddRecordModal() {
    this.showAddRecordModal = false;
    this.resetRecordForm();
  }

  resetRecordForm() {
    this.recordData = {
      amount: '',
      description: '',
      date: '',
      category: '',
      type: 'expense'
    };
  }

  onAddRecord() {
    this.openAddRecordModal();
  }

  onSubmitRecord() {
    console.log("Přidávám záznam", this.recordData);

    const transaction: Transaction = {
      amount: parseFloat(this.recordData.amount as any),
      description: this.recordData.description,
      date: this.recordData.date,
      category: this.recordData.category,
      type: this.recordData.type as 'expense' | 'income'
    };

    this.transactionsService.createTransaction(transaction).subscribe({
      next: () => {
        alert('Záznam byl úspěšně přidán!');
        this.closeAddRecordModal();
        this.loadTransactions();
      },
      error: (err) => {
        console.error('Chyba při přidávání transakce:', err);
        alert('Chyba při přidávání transakce. Zkus to znovu.');
      }
    });
  }

  onLogin() {
    console.log('Odesílám login:', this.loginData);

    this.authService.login(this.loginData).subscribe({
      next: (response: any) => {
        console.log('Odpověď serveru:', response);
        this.authService.loginSuccess(response.email, response.id);
        this.closeModal();
      },
      error: (err) => {
        console.error('Chyba přihlášení:', err);
        alert('Špatný email nebo heslo! Zkus to znovu.');
      }
    });
  }

  onRegister() {
    console.log(this.registerData);
    if (this.registerData.password !== this.registerData.passwordConfirm) {
      alert('Hesla se neshodují');
      return;
    }

    this.authService.register(this.registerData).subscribe({
      next: (response: any) => {
        alert('Registrace úspěšná!');
        this.authService.loginSuccess(this.registerData.email, response.id);
        this.closeModal();
      },
      error: (err: any) => {
        console.error(err);
        alert('Chyba registrace');
      }
    });
  }
}