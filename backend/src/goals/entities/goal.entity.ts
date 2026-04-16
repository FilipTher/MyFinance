import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Goal {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  categoryName!: string;

  @Column()
  icon?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  targetAmount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  savedAmount?: number;

  @ManyToOne(() => User, user => user.goals, { onDelete: 'CASCADE', nullable: true })
  user!: User;
}
