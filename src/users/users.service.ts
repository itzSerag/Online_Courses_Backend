import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from 'src/auth/dto';
import { log } from 'console';
import { UserWithId, UserWithoutPassword } from './types';
import { PaymentStatus } from 'src/payment/types';
import { Level_Name } from '../common/enums';



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
    log('User found:', user);
    return user;
  }

  async findById(id: number): Promise<UserWithId | null> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException("Couldn't fetch user");
    }
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


      // if - 123456  
      // If updating password, hash it before saving
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      const user = await this.prisma.user.update({
        where: { id },
        data,
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

  async getUserOrders(userId: number) {
    try {
      const userOrders = await this.prisma.order.findMany({
        where: { userId },
      });

      return userOrders;
    } catch (err) {
      log('Error fetching user orders:', err);
      throw new Error('Could not fetch user orders');
    }
  }

  async getUserCompletedOrders(userId: number) {
    try {
      const userOrders = await this.prisma.order.findMany({
        where: { userId, paymentStatus: PaymentStatus.COMPLETED },
      });

      return userOrders;
    } catch (err) {
      log('Error fetching user orders:', err);
      throw new Error('Could not fetch user orders');
    }
  }

  async getCompletedDaysInLevel(userId: number, levelName: Level_Name) {
    await this._checkIfUserHasThatLevel(userId, levelName);

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

    const dayNumbers = completedDays.map(
      (completedDay) => completedDay.day.dayNumber,
    );

    return dayNumbers;
  }

  async markDayAsCompleted(
    userId: number,
    levelName: Level_Name,
    dayId: number,
  ) {
    await this._checkIfUserHasThatLevel(userId, levelName);

    const day = await this.prisma.day.upsert({
      where: {
        levelName_dayNumber: {
          levelName: levelName,
          dayNumber: dayId,
        },
      },
      update: {},
      create: {
        levelName: levelName,
        dayNumber: dayId,
      },
      select: { id: true },
    });

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

    return 'Day Completed Successfully';
  }

  async markTaskAsCompleted(
    userId: number,
    levelName: Level_Name,
    dayNumber: number,
    taskName: string,
  ) {
    await this._checkIfUserHasThatLevel(userId, levelName);

    try {
      // Ensure the day exists or create it if it doesn't
      const day = await this.prisma.day.upsert({
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

      log(taskName);
      // Ensure the task exists or create it if it doesn't
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

      return 'Task Completed Successfully';
    } catch (err) {
      throw new Error(`Error completing task: ${err.message}`);
    }
  }

  async getCompletedTasksInDay(
    userId: number,
    levelName: Level_Name,
    day: number,
  ) {
    const userOrders = await this.getUserCompletedOrders(userId);
    if (!userOrders || userOrders.length === 0) {
      throw new ForbiddenException('User has not bought the level');
    }

    // find if the day exists in user progress if not create one
    await this.prisma.userProgress.upsert({
      where: {
        userId_dayId: {
          userId,
          dayId: day,
        },
      },
      update: {},
      create: {
        userId,
        dayId: day,
      },
      select: { id: true },
    });

    // get the tasks completed by the user
    const completedTasks = await this.prisma.userTask.findMany({
      where: {
        userId,
        task: {
          dayId: day,
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
  }

  async _checkIfUserHasThatLevel(userId: number, levelName: Level_Name) {
    const userOrders = await this.getUserCompletedOrders(userId);
    if (
      !userOrders ||
      userOrders.length === 0 ||
      userOrders.map((order) => order.levelName).indexOf(levelName) === -1
    ) {
      throw new ForbiddenException('User has not bought the level');
    }
  }
}
