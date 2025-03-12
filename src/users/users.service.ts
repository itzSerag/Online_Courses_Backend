import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto, UpdateUserDto } from 'src/auth/dto';
import { PaymentStatus } from 'src/payment/types';
import { Level_Name, User } from '@prisma/client'; // Import directly from Prisma

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) { }

  async createUser(data: SignUpDto): Promise<User> {
    try {
      const hashedPassword = await this.hashPassword(data.password);

      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });

      return this.sanitizedUser(user);

    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      if (error.code === 'P2002') {
        throw new BadRequestException('User with this email already exists');
      }
      throw new InternalServerErrorException('User creation failed');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  async findById(id: number): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return this.sanitizedUser(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding user by ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Couldn't fetch user");
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany()

      if (!users || users.length === 0) {
        throw new NotFoundException('No users found');
      }

      return users.map((user) => this.sanitizedUser(user));
    } catch (error) {
      this.logger.error(`Error fetching all users: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not fetch users');
    }
  }

  async updateUser(
    id: number,
    data: UpdateUserDto,
  ): Promise<User> {
    try {
      // If updating password, hash it before saving
      if (data.password) {
        data.password = await this.hashPassword(data.password);
      }

      const user = await this.prisma.user.update({
        where: { id },
        data,
      });


      return this.sanitizedUser(user);
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw new InternalServerErrorException('User update failed');
    }
  }

  async deleteUser(id: number): Promise<User> {
    try {
      // First check if user exists
      await this.findById(id);

      const user = await this.prisma.user.delete({
        where: { id },
      });

      this.logger.log(`Deleted user with ID ${id}`);
      return this.sanitizedUser(user);


    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error deleting user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async verifyUser(email: string): Promise<User> {
    try {
      return this.prisma.user.update({
        where: { email },
        data: { isVerified: true },
      });
    } catch (error) {
      this.logger.error(`Error verifying user: ${error.message}`, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      throw new InternalServerErrorException('User verification failed');
    }
  }

  async getUserOrders(userId: number) {
    try {
      return this.prisma.order.findMany({
        where: { userId },
      });
    } catch (error) {
      this.logger.error(`Error fetching user orders: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not fetch user orders');
    }
  }

  async getUserCompletedOrders(userId: number) {
    try {
      return this.prisma.order.findMany({
        where: {
          userId,
          paymentStatus: PaymentStatus.COMPLETED
        },
      });
    } catch (error) {
      this.logger.error(`Error fetching completed orders: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not fetch completed orders');
    }
  }

  async getCompletedDaysInLevel(userId: number, levelName: Level_Name) {
    try {
      // Check if user has the level
      await this.checkUserLevelAccess(userId, levelName);

      const completedDays = await this.prisma.userProgress.findMany({
        where: {
          userId: userId,
          day: {
            levelName: levelName,
          },
          completed: true,
        },
        select: {
          day: {
            select: {
              dayNumber: true,
            },
          },
        },
      });

      return completedDays.map(
        (completedDay) => completedDay.day.dayNumber,
      );
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error getting completed days: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get completed days');
    }
  }

  async markDayAsCompleted(
    userId: number,
    levelName: Level_Name,
    dayNumber: number,
  ) {
    try {
      // Check if user has the level
      await this.checkUserLevelAccess(userId, levelName);

      const day = await this.getOrCreateDay(levelName, dayNumber);

      // Upsert the user progress
      await this.prisma.userProgress.upsert({
        where: {
          userId_dayId: {
            userId: userId,
            dayId: day.id,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          userId: userId,
          dayId: day.id,
          completed: true,
          completedAt: new Date(),
        },
      });

      return { message: 'Day completed successfully' };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error marking day as completed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to mark day as completed');
    }
  }

  async markTaskAsCompleted(
    userId: number,
    levelName: Level_Name,
    dayNumber: number,
    taskName: string,
  ) {
    try {
      // Check if user has the level
      await this.checkUserLevelAccess(userId, levelName);

      // Get or create the day
      const day = await this.getOrCreateDay(levelName, dayNumber);

      // Get or create the task
      const task = await this.prisma.task.upsert({
        where: {
          dayId_name: {
            dayId: day.id,
            name: taskName,
          },
        },
        update: {},
        create: {
          dayId: day.id,
          name: taskName,
          description: 'Task Default Description',
        },
        select: { id: true },
      });

      // Mark the task as completed for the user
      await this.prisma.userTask.upsert({
        where: {
          userId_taskId: {
            userId: userId,
            taskId: task.id,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          userId: userId,
          taskId: task.id,
          completed: true,
          completedAt: new Date(),
        },
      });

      return { message: 'Task completed successfully' };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error marking task as completed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to mark task as completed');
    }
  }

  async getCompletedTasksInDay(
    userId: number,
    levelName: Level_Name,
    dayNumber: number,
  ) {
    try {
      // Check if user has the level
      await this.checkUserLevelAccess(userId, levelName);

      // First find the day
      const day = await this.prisma.day.findUnique({
        where: {
          levelName_dayNumber: {
            levelName: levelName,
            dayNumber: dayNumber,
          },
        },
      });

      if (!day) {
        return []; // No tasks completed yet because the day doesn't exist
      }

      // Get the tasks completed by the user
      const completedTasks = await this.prisma.userTask.findMany({
        where: {
          userId,
          task: {
            dayId: day.id,
          },
          completed: true,
        },
        select: {
          task: {
            select: {
              name: true,
            },
          },
        },
      });

      return completedTasks.map((task) => task.task.name);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error getting completed tasks: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get completed tasks');
    }
  }

  // Helper Methods
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async getOrCreateDay(levelName: Level_Name, dayNumber: number) {
    return this.prisma.day.upsert({
      where: {
        levelName_dayNumber: {
          levelName: levelName,
          dayNumber: dayNumber,
        },
      },
      update: {},
      create: {
        levelName: levelName,
        dayNumber: dayNumber,
      },
      select: { id: true },
    });
  }

  private async checkUserLevelAccess(userId: number, levelName: Level_Name) {
    const userOrders = await this.getUserCompletedOrders(userId);

    if (!userOrders || userOrders.length === 0) {
      throw new ForbiddenException('User has not purchased any levels');
    }

    const hasLevel = userOrders.some(order => order.levelName === levelName);

    if (!hasLevel) {
      throw new ForbiddenException(`User has not purchased level ${levelName}`);
    }
  }

  private sanitizedUser(user: User) {
    delete user.password
    return user;
  }
}