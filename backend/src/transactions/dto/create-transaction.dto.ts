export class CreateTransactionDto {
  amount: number;
  description: string;
  date: string;
  category: string;
  type: 'expense' | 'income';
}
