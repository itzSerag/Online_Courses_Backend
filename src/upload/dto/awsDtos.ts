import { IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { Level_Name } from '../../common/enums';

export class UploadFileDTO {
  @IsNotEmpty()
  @IsEnum(Level_Name)
  level_name: Level_Name;

  @IsNotEmpty()
  // matches days from 1 to 50 only
  @Matches(/^([1-9]|[1-4][0-9]|50)$/)
  day: string;
}
