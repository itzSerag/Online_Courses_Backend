import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from 'src/auth/dto';
import { log } from 'console';
import { UserWithId, UserWithoutPassword } from './types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: SignUpDto): Promise<UserWithId> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create the user with the hashed password
      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });

      return user;

    } catch (err) {
      log('Error creating user:', err);
      throw new Error('User creation failed');
    }
  }

  async findByEmail(email: string): Promise<UserWithId | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      return user;
    }
    return null;
  }

  async findById(id: number): Promise<UserWithoutPassword | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAllUsers(): Promise<UserWithoutPassword[]> {
    try {
      const users = await this.prisma.user.findMany();

      if (!users || users.length === 0) {
        throw new NotFoundException('No users found');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const usersWithoutPassword = users.map(({ password, ...rest }) => rest);
      return usersWithoutPassword;
    } catch (err) {
      log('An error occurred while fetching users:', err);
      throw new Error('Could not fetch users');
    }
  }

  async updateUser(
    id: number,
    data: Partial<UserWithId>,
  ): Promise<UserWithoutPassword> {
    try {
      // If updating password, hash it before saving
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      const user = await this.prisma.user.update({
        where: { id },
        data  ,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (err) {
      log('Error updating user:', err);
      throw new Error('User update failed');
    }
  }

  async deleteUser(id: number): Promise<UserWithoutPassword> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = deletedUser;
    log('Deleted user' + userWithoutPassword);
    return userWithoutPassword;
  }

  async verifyUser(email: string): Promise<UserWithId> {
    return this.prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });
  }
}
