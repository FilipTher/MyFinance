import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  async login(email: string, heslo: string) {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new UnauthorizedException('Špatný email nebo heslo.');
    }

    const isMatch = await bcrypt.compare(heslo, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Špatný email nebo heslo.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      initialBalance: user.initialBalance,
      createdAt: user.createdAt,
      zprava: 'Jsi tam, borče!'
    };
  }
  
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.usersRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      role: 'user',
      name: createUserDto.name,
      initialBalance: createUserDto.initialBalance || 0,
    });

    try {
      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new ConflictException('Tento email už je zaregistrovaný.');
      }
      throw error;
    }
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async updateBalance(userId: number, initialBalance: number) {
    return this.usersRepository.update(userId, { initialBalance });
  }

  async getUserById(userId: number) {
    return this.usersRepository.findOneBy({ id: userId });
  }

  async updateUser(userId: number, updateData: any) {
    return this.usersRepository.update(userId, updateData);
  }
}