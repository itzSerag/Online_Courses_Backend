import { Level_Name } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class PaymentRequestDTO {
  @IsString()
  @IsNotEmpty()
  item_name: Level_Name;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}
