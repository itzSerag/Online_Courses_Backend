import { Level_Name } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UserTask {
  @IsNotEmpty()
  @IsEnum(Level_Name)
  levelName: Level_Name;

  @IsNumber()
  day: number;

  @IsString()
  taskName?: string;
}
