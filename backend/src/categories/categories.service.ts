import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { IsNull } from 'typeorm';
import { Goal } from '../goals/entities/goal.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    @InjectRepository(Goal) private goalRepository: Repository<Goal>
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: number) {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      user: { id: userId },
      categoryFor: createCategoryDto.categoryFor || 'transaction'
    });
    return this.categoryRepository.save(category);
  }

  async findAll(userId: number, categoryFor: string = 'transaction') {
    return this.categoryRepository.find({
      where: [
        { user: { id: userId }, categoryFor },
        { user: IsNull(), categoryFor }
      ],
      relations: ['user']
    });
  }

  async findOne(id: number) {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.categoryRepository.update(id, updateCategoryDto);
    return this.categoryRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    
    if (category && category.categoryFor === 'goal') {
      await this.goalRepository.delete({ categoryName: category.name });
    }
    
    return this.categoryRepository.delete(id);
  }

  async onModuleInit() {
    const count = await this.categoryRepository.count();
    
    if (count === 0) {
      const defaultCategories = [
        { name: 'Příjem', type: 'income' },
        { name: 'Výdaj', type: 'expense' },
      ];

      await this.categoryRepository.save(defaultCategories);
      console.log('Základní kategorie byly úspěšně vytvořeny.');
    }
  }
}
