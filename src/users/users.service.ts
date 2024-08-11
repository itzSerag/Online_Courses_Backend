import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from 'src/auth/dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: SignUpDto): Promise<any> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
    return user;
  }

  async findByEmail(email: string): Promise<any> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
