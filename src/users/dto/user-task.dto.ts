import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { Level_Name } from '../../common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UserTaskDto {
    @ApiProperty({ description: 'The level name', enum: Level_Name })
    @IsNotEmpty()
    @IsEnum(Level_Name)
    levelName: Level_Name;

    @ApiProperty({ description: 'The day number', minimum: 1, maximum: 50 })
    @IsInt()
    @Min(1, { message: 'Day must be a positive number' })
    @Max(50, { message: 'Day cannot be greater than 50' })
    day: number;

    @ApiProperty({ description: 'The task name' })
    @IsNotEmpty()
    @IsString()
    taskName: string;
}