import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { LESSONS } from '../../common/enums/lessons';
import { Type } from 'class-transformer';
import { Level_Name } from '../../common/enums';

// NOT INTERFACES BECAUSE WE NEED TO VALIDATE THE DATA

export class UploadDTO {
  @IsNotEmpty()
  @IsEnum(LESSONS)
  key: LESSONS;

  @IsNotEmpty()
  @IsEnum(Level_Name)
  level_name: string;

  // want it from 1 to 50 only
  @IsNotEmpty()
  @Matches(/^([1-9]|[1-4][0-9]|50)$/)
  day: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  content:
    | READ[]
    | PICTURES[]
    | LISTEN[]
    | Q_A[]
    | WRITE[]
    | SPEAK[]
    | GRAMMAR[]
    | DAILY_TEST[]
    | IDIOMS[];
}

class READ {
  @IsString()
  @IsNotEmpty()
  soundSrc: string;

  @IsString()
  @IsNotEmpty()
  transcript: string;
}

// TESTING
class PICTURES {
  @IsString()
  @IsNotEmpty()
  pictureSrc: string;
}

class LISTEN {
  @IsString()
  @IsNotEmpty()
  soundSrc: string;
}

class Q_A {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

class WRITE {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

class SPEAK {
  @IsString()
  @IsNotEmpty()
  soundSrc: string;
}

class GRAMMAR {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

class DAILY_TEST {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

class IDIOMS {
  @IsString()
  @IsNotEmpty()
  idiom: string;

  @IsString()
  @IsNotEmpty()
  meaning: string;
}
