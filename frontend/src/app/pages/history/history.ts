import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History {
  filtry = {
    hledat: '',
    typ: 'vse',
    kategorie: 'vse',
    typZaznamu: 'vse',
    castka: 0
  };

  transakce = [
    { vybrano: false, nazev: 'Potraviny', castka: -1523, datum: '20.11.2025', popis: '-', ikona: 'shopping_cart', barva: 'red' },
    { vybrano: false, nazev: 'Zábava', castka: -1599, datum: '20.11.2025', popis: 'akce s přáteli', ikona: 'headphones', barva: 'red' },
    { vybrano: false, nazev: 'Utilities', castka: -12512, datum: '20.11.2025', popis: 'elektřina...', ikona: 'bolt', barva: 'red' },
    { vybrano: false, nazev: 'Dárky', castka: -2500, datum: '20.11.2025', popis: '-', ikona: 'card_giftcard', barva: 'red' },
    { vybrano: false, nazev: 'Auto', castka: -10531, datum: '20.11.2025', popis: '-', ikona: 'directions_car', barva: 'red' },
    { vybrano: false, nazev: 'Výplata', castka: 27589, datum: '20.11.2025', popis: '-', ikona: 'account_balance_wallet', barva: 'green' },
    { vybrano: false, nazev: 'Potraviny', castka: -511, datum: '20.11.2025', popis: '-', ikona: 'shopping_cart', barva: 'red' },
    { vybrano: false, nazev: 'Utilities', castka: -12512, datum: '20.11.2025', popis: '-', ikona: 'bolt', barva: 'red' },
  ];
}