import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  date: Date;

  @ManyToOne(() => User, user => user.transactions, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Category, category => category.transactions, { onDelete: 'CASCADE' })
  category: Category;
}