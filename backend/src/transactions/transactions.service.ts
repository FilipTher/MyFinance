import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class TransactionsService {
  constructor(@InjectRepository(Transaction) private transactionRepository: Repository<Transaction>, @InjectRepository(Category)
  private categoriesRepository: Repository<Category>,) { }

  async create(createTransactionDto: CreateTransactionDto, userId: number) {
    const category = await this.categoriesRepository.findOne({
      where: { id: parseInt(createTransactionDto.category) }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const transaction = this.transactionRepository.create({
      amount: createTransactionDto.amount,
      description: createTransactionDto.description,
      date: new Date(createTransactionDto.date),
      type: category.type as 'expense' | 'income',
      category: category,
      user: { id: userId }
    });

    return this.transactionRepository.save(transaction);
  }

  async findAll(userId: number) {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      relations: ['category']
    });
  }

  findOne(id: number) {
    return this.transactionRepository.findOne({ where: { id }, relations: ['category'] });
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    const updateData: any = {
      amount: updateTransactionDto.amount,
      description: updateTransactionDto.description,
      date: updateTransactionDto.date ? new Date(updateTransactionDto.date) : undefined,
    };

    if (updateTransactionDto.type) {
      updateData.type = updateTransactionDto.type;
    }

    if (updateTransactionDto.category) {
      const category = await this.categoriesRepository.findOne({
        where: { id: parseInt(updateTransactionDto.category) }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      updateData.category = category;
    }

    return this.transactionRepository.update(id, updateData);
  }

  remove(id: number) {
    return this.transactionRepository.delete(id);
  }
}

