import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PaymentRequestDTO {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  item_name: string;

  @IsString()
  @IsNotEmpty()
  item_description: string;

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
