import { Injectable } from '@nestjs/common';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Repository } from 'typeorm';
import { Goal } from './entities/goal.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';

@Injectable()
export class GoalsService {
  constructor(@InjectRepository(Goal) private goalRepository: Repository<Goal>) {}

  async create(createGoalDto: CreateGoalDto, userId: number) {
    const goal = this.goalRepository.create({
      ...createGoalDto,
      user: { id: userId }
    });
    return this.goalRepository.save(goal);
  }

  async findAll(userId: number) {
    return this.goalRepository.find({
      where: { user: { id: userId } },
      relations: ['user']
    });
  }

  async findOne(id: number) {
    return this.goalRepository.findOne({ where: { id } });
  }

  async update(id: number, updateGoalDto: UpdateGoalDto) {
    await this.goalRepository.update(id, updateGoalDto);
    return this.goalRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    return this.goalRepository.delete(id);
  }
}
