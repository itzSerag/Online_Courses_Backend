import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Level_Name } from 'src/common/types';

export class UserFinishedDays {
  @IsNotEmpty()
  @IsEnum(Level_Name) // Add enum validation here
  levelName: Level_Name;
}

export class UserFinishDay {
  @IsNotEmpty()
  @IsEnum(Level_Name) // Validate that levelName is one of the enum values
  levelName: Level_Name;

  @IsNotEmpty()
  @IsNumber()
  day: number;
}
