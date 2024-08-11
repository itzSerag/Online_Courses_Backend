import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtStrategy } from '../auth/strategy/jwt.strategy';
import { AdminGuard } from '../auth/guard/admin.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  getAllCategories() {
    return this.categoriesService.getAllCategories();
  }

  @Get(':id')
  getCategoryById(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(parseInt(id));
  }

  @Post()
  @UseGuards(JwtStrategy, AdminGuard)
  createCategory(@Body('name') name: string) {
    return this.categoriesService.createCategory(name);
  }

  @Put(':id')
  @UseGuards(JwtStrategy, AdminGuard)
  updateCategory(@Param('id') id: string, @Body('name') name: string) {
    return this.categoriesService.updateCategory(parseInt(id), name);
  }

  @Delete(':id')
  @UseGuards(JwtStrategy, AdminGuard)
  deleteCategory(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(parseInt(id));
  }
}
