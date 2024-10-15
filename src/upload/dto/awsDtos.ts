import { IsNotEmpty, Matches } from 'class-validator';
import { Level_Name } from 'src/common/types';

export class UploadDayContentDTO {
  @IsNotEmpty()
  item_name: Level_Name;

  @IsNotEmpty()
  stage: 'Stage_1' | 'Stage_2';

  @IsNotEmpty()
  @Matches(/^Day_(1[0-9]|2[0-5]|[1-9])$/)
  // matches days from 1 to 25 only
  day: string;
}
