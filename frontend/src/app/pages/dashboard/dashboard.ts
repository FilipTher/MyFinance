import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  transakce = [
  { nazev: 'Potraviny', castka: -1523, datum: '20.11.2025', ikona: 'shopping_cart', barva: 'red' },
  { nazev: 'Zábava', castka: -1599, datum: '20.11.2025', popis: 'akce s přáteli', ikona: 'headphones', barva: 'red' },
  { nazev: 'Utilities', castka: -12512, datum: '20.11.2025', popis: 'elektřina...', ikona: 'bolt', barva: 'red' },
  { nazev: 'Dárky', castka: -2500, datum: '20.11.2025', ikona: 'card_giftcard', barva: 'red' },
  { nazev: 'Auto', castka: -10531, datum: '20.11.2025', ikona: 'directions_car', barva: 'red' },
  { nazev: 'Výplata', castka: 27589, datum: '20.11.2025', ikona: 'account_balance_wallet', barva: 'green' }, 
  ];
}