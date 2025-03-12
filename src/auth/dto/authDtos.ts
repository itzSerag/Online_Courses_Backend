import { Role } from '@prisma/client';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  strategy?: 'local' | 'facebook' | 'google';

  role?: 'USER' | 'ADMIN';

  isVerified?: boolean;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto {
  email?: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
  isVerified?: boolean;
}

export class PayLoad {
  email: string;
  sub: number;
  roles: string;
}
