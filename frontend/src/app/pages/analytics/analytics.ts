import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { TransactionsService, Transaction } from '../../services/transactions.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class Analytics implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private monthNames = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
  private allTransactions: Transaction[] = [];

  startDate: string = '';
  endDate: string = '';

  public incomeData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
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
    labels: [],
    datasets: [
      {
        data: [],
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

  constructor(private transactionsService: TransactionsService, private cd: ChangeDetectorRef) {
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    this.endDate = this.formatDateForInput(today);
    this.startDate = this.formatDateForInput(oneYearAgo);
  }

  ngOnInit() {
    this.loadTransactionsAndUpdateCharts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDateRangeChange() {
    this.aggregateTransactionsAndUpdateCharts();
  }

  private loadTransactionsAndUpdateCharts() {
    this.transactionsService.getTransactions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transactions: Transaction[]) => {
          this.allTransactions = transactions;
          this.aggregateTransactionsAndUpdateCharts();
        },
        error: (err) => {
          console.error('Chyba při načítání transakcí pro Analytics:', err);
        }
      });
  }

  private aggregateTransactionsAndUpdateCharts() {
    const startDateObj = new Date(this.startDate);
    const endDateObj = new Date(this.endDate);
    
    const filteredTransactions = this.allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDateObj && transactionDate <= endDateObj;
    });

    const monthLabels = this.generateMonthLabelsForRange(startDateObj, endDateObj);
    const monthData = this.initializeMonthData(monthLabels.length);

    filteredTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthIndex = this.getMonthIndexInRange(transactionDate, startDateObj);
      
      if (monthIndex >= 0 && monthIndex < monthLabels.length) {
        const amount = typeof transaction.amount === 'string' 
          ? parseFloat(transaction.amount) 
          : transaction.amount;

        if (transaction.type === 'income') {
          (monthData.income as number[])[monthIndex] += amount;
        } else if (transaction.type === 'expense') {
          (monthData.expense as number[])[monthIndex] += amount;
        }
      }
    });

    this.incomeData = {
      ...this.incomeData,
      labels: monthLabels,
      datasets: [
        {
          ...this.incomeData.datasets[0],
          data: monthData.income
        }
      ]
    };
    
    this.expenseData = {
      ...this.expenseData,
      labels: monthLabels,
      datasets: [
        {
          ...this.expenseData.datasets[0],
          data: monthData.expense
        }
      ]
    };

    this.cd.markForCheck();
  }

  private generateMonthLabelsForRange(startDate: Date, endDate: Date): string[] {
    const labels: string[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (current <= end) {
      const monthIndex = current.getMonth();
      const year = current.getFullYear();
      labels.push(`${this.monthNames[monthIndex]} ${year}`);
      current.setMonth(current.getMonth() + 1);
    }

    return labels;
  }

  private getMonthIndexInRange(date: Date, rangeStart: Date): number {
    const rangeYear = rangeStart.getFullYear();
    const rangeMonth = rangeStart.getMonth();
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();

    const monthsDiff = (dateYear - rangeYear) * 12 + (dateMonth - rangeMonth);
    return monthsDiff;
  }

  private initializeMonthData(length: number): { income: number[], expense: number[] } {
    return {
      income: new Array(length).fill(0),
      expense: new Array(length).fill(0)
    };
  }
}