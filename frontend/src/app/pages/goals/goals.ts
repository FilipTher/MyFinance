import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './goals.html',
  styleUrl: './goals.css'
})
export class Goals {
  
  kategorieCilu = [
    {
      nazev: 'Nájem a energie',
      cile: [
        { nazev: 'Nájem', ikona: 'home', nasetreno: 7780, cil: 10000 },
        { nazev: 'Energie', ikona: 'bolt', nasetreno: 3275, cil: 6000 }
      ]
    },
    {
      nazev: 'Nezbytné',
      cile: [
        { nazev: 'Potraviny', ikona: 'shopping_bag', nasetreno: 3500, cil: 3500 },
        { nazev: 'Auto', ikona: 'directions_car', nasetreno: 2000, cil: 2000 }
      ]
    },
    {
      nazev: 'Zbytné',
      cile: [
        { nazev: 'Předplatná', ikona: 'headphones', nasetreno: 750, cil: 750 },
        { nazev: 'Akce', ikona: 'camera_alt', nasetreno: 500, cil: 2000 }
      ]
    }
  ];

  getProcento(nasetreno: number, cil: number): number {
    const proc = (nasetreno / cil) * 100;
    return proc > 100 ? 100 : Math.round(proc);
  }
}