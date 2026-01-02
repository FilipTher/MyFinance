import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {
  
  nastaveni = {
    mena: 'CZK',
    jazyk: 'cz',
    tmavyRezim: true,
    notifikaceEmail: true,
    notifikaceMobil: false,
    zvuky: true
  };

  ulozitNastaveni() {
    console.log('Ukládám:', this.nastaveni);
    alert('Nastavení bylo úspěšně uloženo.');
  }

  resetovatData() {
    const potvrzeni = confirm('Opravdu chcete smazat všechna data? Tato akce je nevratná!');
    if (potvrzeni) {
      alert('Všechna data byla vymazána (simulace).');
    }
  }
}