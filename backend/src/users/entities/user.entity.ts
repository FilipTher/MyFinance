import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Goal } from '../../goals/entities/goal.entity';
import { OneToMany } from 'typeorm';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: 'user' })
  role!: string;

  @OneToMany(() => Category, category => category.user)
  categories?: Category[];

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions?: Transaction[];

  @OneToMany(() => Goal, goal => goal.user)
  goals?: Goal[];
}