import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';
import { CategoriesModule } from './categories/categories.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UploadModule,
    CategoriesModule,
    CoursesModule,
    LessonsModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],

  providers: [AppService],
})
export class AppModule {}
