import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class Analytics {

  public incomeData: ChartConfiguration<'line'>['data'] = {
    labels: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec'],
    datasets: [
      {
        data: [15000, 22000, 18000, 24000, 21000, 26000, 30000],
        label: 'Příjmy',
        fill: true,
        tension: 0.4,
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        pointBackgroundColor: '#2ecc71'
      }
    ]
  };

  public expenseData: ChartConfiguration<'line'>['data'] = {
    labels: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec'],
    datasets: [
      {
        data: [12000, 14000, 11000, 18000, 16000, 13000, 19000],
        label: 'Výdaje',
        fill: true,
        tension: 0.4,
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        pointBackgroundColor: '#e74c3c'
      }
    ]
  };

  public chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { color: '#444' },
        ticks: { color: '#aaa' }
      },
      y: {
        grid: { color: '#444' },
        ticks: { color: '#aaa' }
      }
    }
  };
}