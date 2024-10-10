import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export enum Level_Name {
  LEVEL_A1 = 'LEVEL_A1',
  LEVEL_A2 = 'LEVEL_A2',
  LEVEL_B1 = 'LEVEL_B1',
  LEVEL_B2 = 'LEVEL_B2',
  LEVEL_C1 = 'LEVEL_C1',
  LEVEL_C2 = 'LEVEL_C2',
}

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
