import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoriesController } from './categories.controller';

@Module({
  providers: [CategoriesService],
  imports: [PrismaModule],
  controllers: [CategoriesController],

})
export class CategoriesModule {}
