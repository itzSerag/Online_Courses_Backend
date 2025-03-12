import { IsEnum, IsNotEmpty } from 'class-validator';
import { Level_Name } from '../../common/enums';

export class GetCompletedDaysDto {

    @IsNotEmpty()
    @IsEnum(Level_Name)
    levelName: Level_Name;
}