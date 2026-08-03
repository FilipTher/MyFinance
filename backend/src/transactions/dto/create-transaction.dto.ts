export class CreateTransactionDto {
  amount: number;
  description: string;
  date: string;
  category: string;
  icon?: string;
  type: 'expense' | 'income';
}
