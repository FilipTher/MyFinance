import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginData: CreateUserDto) {
    return this.usersService.login(loginData.email, loginData.password);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.getUserById(+id);
  }

  @Patch(':id/balance')
  updateBalance(@Param('id') id: string, @Body() updateData: { initialBalance: number }) {
    return this.usersService.updateBalance(+id, updateData.initialBalance);
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() updateData: any) {
    return this.usersService.updateUser(+id, updateData);
  }

}
