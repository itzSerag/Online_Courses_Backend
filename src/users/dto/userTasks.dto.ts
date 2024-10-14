import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Level_Name } from 'src/core/types';

export class UserTask {
  @IsNotEmpty()
  @IsEnum(Level_Name)
  levelName: Level_Name;

  @IsNumber()
  day: number;

  @IsString()
  taskName?: string;
}
