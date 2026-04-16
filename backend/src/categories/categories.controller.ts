import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
    const userId = req.user?.id || 1;
    return this.categoriesService.create(createCategoryDto, userId);
  }

  @Get()
  findAll(@Query('userId') userId?: string, @Query('categoryFor') categoryFor?: string, @Request() req?: any) {
    const id = userId ? parseInt(userId) : (req?.user?.id || 1);
    const category = categoryFor || 'transaction';
    return this.categoriesService.findAll(id, category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
