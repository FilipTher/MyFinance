import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  editace = false;

  uzivatel = {
    jmeno: 'Jmeno Uzivatele',
    email: 'jan.novak@example.com',
    telefon: '+420 123 456 789',
    registrace: '20.11.2024',
    pocetTransakci: 142,
    clenstvi: 'Premium'
  };

  prepnoutEditaci() {
    if (this.editace) {
      console.log('Ukládám data...', this.uzivatel);
    }
    this.editace = !this.editace;
  }

  logout() {
    alert('Byl jste úspěšně odhlášen (simulace).');
  }
}