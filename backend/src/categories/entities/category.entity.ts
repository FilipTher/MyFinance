import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @ManyToOne(() => User, user => user.categories, { onDelete: 'CASCADE', nullable: true })
  user: User;

  @OneToMany(() => Transaction, transaction => transaction.category)
  transactions: Transaction[];
}