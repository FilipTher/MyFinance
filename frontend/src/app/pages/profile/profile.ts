import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TransactionsService } from '../../services/transactions.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  editace = false;

  uzivatel = {
    jmeno: '',
    email: '',
    registrace: '',
    mesicu: 0,
    pocetTransakci: 0,
    clenstvi: 'Standard'
  };

  constructor(
    public authService: AuthService, 
    private transactionsService: TransactionsService,
    private http: HttpClient, 
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadUserData();
    this.loadTransactionCount();
  }

  loadUserData() {
    this.uzivatel.jmeno = this.authService.currentUserFullName || this.authService.currentUserName;
    this.uzivatel.email = this.authService.currentUserName;
    
    const createdAt = this.authService.getCreatedAt();
    if (createdAt) {
      const registrationDate = new Date(createdAt);
      this.uzivatel.registrace = registrationDate.toLocaleDateString('cs-CZ');
      this.uzivatel.mesicu = this.calculateMonths(registrationDate);
    } else {
      this.uzivatel.registrace = new Date().toLocaleDateString('cs-CZ');
      this.uzivatel.mesicu = 0;
    }
  }

  calculateMonths(registrationDate: Date): number {
    const today = new Date();
    let months = (today.getFullYear() - registrationDate.getFullYear()) * 12;
    months += today.getMonth() - registrationDate.getMonth();
    return Math.max(0, months);
  }

  loadTransactionCount() {
    this.transactionsService.getTransactions().subscribe({
      next: (data: any[]) => {
        console.log('Transactions loaded:', data);
        this.uzivatel.pocetTransakci = data.length;
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Chyba při načítání počtu transakcí:', err);
        this.uzivatel.pocetTransakci = 0;
        this.cd.markForCheck();
      }
    });
  }

  prepnoutEditaci() {
    if (this.editace) {
      console.log('Ukládám data...', this.uzivatel);
      this.saveUserData();
    }
    this.editace = !this.editace;
  }

  saveUserData() {
    const userId = this.authService.currentUserId;
    if (!userId) {
      alert('Uživatel není přihlášen.');
      return;
    }

    this.http.patch(`http://localhost:3000/users/${userId}`, {
      name: this.uzivatel.jmeno
    }).subscribe({
      next: () => {
        this.authService.updateUserProfile(this.uzivatel.jmeno);
        alert('Údaje byly úspěšně uloženy.');
      },
      error: (err) => {
        console.error('Chyba při ukládání údajů:', err);
        alert('Chyba při ukládání údajů.');
      }
    });
  }

  changePassword() {
    const oldPassword = prompt('Zadej staré heslo:');
    if (!oldPassword) return;
    
    const newPassword = prompt('Zadej nové heslo:');
    if (!newPassword) return;
    
    const newPasswordConfirm = prompt('Potvrď nové heslo:');
    if (newPasswordConfirm !== newPassword) {
      alert('Hesla se neshodují!');
      return;
    }

    alert('Heslo bylo změněno (simulace).');
  }

  logout() {
    if (confirm('Opravdu se chceš odhlásit?')) {
      this.authService.logout();
      this.router.navigate(['/']);
      alert('Byl jsi úspěšně odhlášen.');
    }
  }
}