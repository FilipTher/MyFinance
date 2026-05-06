import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto & { userId?: number }, @Request() req: any) {
    console.log('Přijatá data z frontendu:', createTransactionDto);
    const userId = createTransactionDto.userId || req.user?.id || 1;
    return this.transactionsService.create(createTransactionDto, userId);
  }

  @Get()
  findAll(@Query('userId') userId?: string, @Request() req?: any) {
    const id = userId ? parseInt(userId) : (req?.user?.id || 1);
    return this.transactionsService.findAll(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}
