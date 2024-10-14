import { IsNotEmpty, IsString } from 'class-validator';
import { Level_Name } from 'src/core/types';

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
