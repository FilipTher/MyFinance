import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TransactionsService } from '../../services/transactions.service';
import { CategoriesService } from '../../services/categories.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {
  
  nastaveni = {
    mena: 'CZK',
    initialBalance: 0
  };

  isEditingBalance = false;
  tempBalance: number = 0;

  constructor(
    public authService: AuthService, 
    private http: HttpClient,
    private transactionsService: TransactionsService,
    private categoriesService: CategoriesService
  ) {
    this.nastaveni.initialBalance = this.authService.getBalance();
    this.tempBalance = this.nastaveni.initialBalance;
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('myfinance_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      this.nastaveni.mena = parsed.mena || 'CZK';
    }
  }

  editBalance() {
    this.isEditingBalance = true;
    this.tempBalance = this.nastaveni.initialBalance;
  }

  saveBalance() {
    const userId = this.authService.currentUserId;
    if (!userId) {
      alert('Uživatel není přihlášen.');
      return;
    }

    this.http.patch(`http://localhost:3000/users/${userId}/balance`, {
      initialBalance: this.tempBalance
    }).subscribe({
      next: () => {
        this.nastaveni.initialBalance = this.tempBalance;
        this.authService.updateBalance(this.tempBalance);
        this.isEditingBalance = false;
        alert('Počáteční zůstatek byl úspěšně aktualizován!');
      },
      error: (err) => {
        console.error('Chyba při aktualizaci zůstatku:', err);
        alert('Chyba při aktualizaci zůstatku.');
      }
    });
  }

  cancelEditBalance() {
    this.isEditingBalance = false;
    this.tempBalance = this.nastaveni.initialBalance;
  }

  ulozitNastaveni() {
    const settings = {
      mena: this.nastaveni.mena
    };
    localStorage.setItem('myfinance_settings', JSON.stringify(settings));
    alert('Nastavení bylo úspěšně uloženo.');
  }

  resetovatData() {
    const potvrzeni = confirm('Opravdu chcete smazat všechna data? Tato akce je nevratná!');
    if (potvrzeni) {
      const userId = this.authService.currentUserId;
      if (!userId) {
        alert('Uživatel není přihlášen.');
        return;
      }

      this.transactionsService.getTransactions().subscribe({
        next: (transactions: any[]) => {
          const deleteTransactionsPromise = transactions.length > 0 
            ? new Promise((resolve) => {
                const transactionIds = transactions.map((t: any) => t.id);
                this.transactionsService.deleteTransactions(transactionIds).subscribe({
                  next: () => resolve(true),
                  error: () => resolve(false)
                });
              })
            : Promise.resolve(true);

          deleteTransactionsPromise.then(() => {
            this.categoriesService.getCategories().subscribe({
              next: (categories: any[]) => {
                if (categories.length === 0) {
                  alert('Všechna data byla úspěšně smazána!');
                  return;
                }

                let categoryDeleted = 0;
                categories.forEach((category: any) => {
                  this.categoriesService.deleteCategory(category.id).subscribe({
                    next: () => {
                      categoryDeleted++;
                      if (categoryDeleted === categories.length) {
                        alert('Všechna data byla úspěšně smazána!');
                      }
                    },
                    error: (err) => {
                      console.error('Chyba při mazání kategorie:', err);
                      categoryDeleted++;
                      if (categoryDeleted === categories.length) {
                        alert('Všechna data byla úspěšně smazána!');
                      }
                    }
                  });
                });
              },
              error: (err) => {
                console.error('Chyba při načítání kategorií:', err);
                alert('Transakce byly smazány, ale došlo k chybě při mazání kategorií.');
              }
            });
          });
        },
        error: (err) => {
          console.error('Chyba při načítání transakcí:', err);
          alert('Chyba při načítání transakcí.');
        }
      });
    }
  }
}