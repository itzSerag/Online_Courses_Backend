import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  validate,
  ValidationError,
} from 'class-validator';
import { LESSONS } from '../../common/enums/lessons';
import { Level_Name } from '../../common/enums';
import { BadRequestException } from '@nestjs/common';

// Main DTO
export class UploadDTO {


  @IsNotEmpty()
  @IsEnum(LESSONS)
  lesson_name: LESSONS;

  @IsNotEmpty()
  @IsEnum(Level_Name)
  level_name: Level_Name;

  // Only allows day from 1 to 50
  @IsNotEmpty()
  @Matches(/^([1-9]|[1-4][0-9]|50)$/)
  day: string;

  @IsArray()
  data: any[];
}

// EVERY OBJ should look like that

// Validation classes
class READ {


  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  id?: string

  
  @IsString()
  @IsNotEmpty()
  soundSrc: string;

  @IsString()
  @IsNotEmpty()
  transcript: string;
}

class WRITE {


  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  id?: string


  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

class PICTURES {

  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  id?: string

  @IsString()
  @IsNotEmpty()
  soundSrc: string;

  @IsString()
  @IsNotEmpty()
  pictureSrc: string;


  @IsString()
  @IsNotEmpty()
  wordEn: string;

  @IsArray()
  @IsNotEmpty()
  otherWords: Array<string>

  @IsString()
  @IsNotEmpty()
  definition: string

  @IsArray()
  @IsNotEmpty()
  examples: Array<string>
}

class LISTEN {
  // No validation needed as audio will be uploaded
}

class Q_A {
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
  text: string;
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

// Mapping from key to validation class
const validationMap = {
  READ,
  WRITE,
  PICTURES,
  LISTEN,
  Q_A,
  SPEAK,
  GRAMMAR,
  DAILY_TEST,
  IDIOMS,
};

export async function validateData(
  key: LESSONS,
  data: any[],
): Promise<boolean> {
  const ValidatorClass = validationMap[key];

  if (!ValidatorClass) {
    throw new Error(`No validation schema found for key: ${key}`);
  }

  // Skip validation for LISTEN as it only needs files
  if (key === LESSONS.LISTEN) {
    return true;
  }

  const validationErrors: ValidationError[] = [];

  // Validate each item in the data array
  for (const item of data) {
    const instance = Object.assign(new ValidatorClass(), item);
    const errors = await validate(instance);
    if (errors.length > 0) {
      validationErrors.push(...errors);
    }
  }

  if (validationErrors.length > 0) {
    throw new BadRequestException(
      'Please fill the data in a proper way as documented',
    );
  }

  return true;
}
