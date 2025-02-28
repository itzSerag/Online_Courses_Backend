import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  NotFoundException,
  Param,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
  ParseIntPipe,
  Query,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { UsersService } from './users.service';
import { SignUpDto, UpdateUserDto } from '../auth/dto';
import { UserWithoutPassword as User } from './types'; // Assuming you have a User entity
import { UserFinishDay, UserTask } from './dto';
import { Level_Name } from '../common/enums';
import { CurUser } from './decorators/get-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('/me')
  getMe(@CurUser() user: User): User {
    return user;
  }
  
  @Get('email/:email')
  @UseGuards(AdminGuard)
  async getUserByEmail(@Param('email') email: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithOutPassword } = user;
    return userWithOutPassword;
  }

  @Get('/all')
  @UseGuards(AdminGuard)
  getAllUsers(): Promise<User[]> {
    return this.userService.findAllUsers();
  }

  @Get('/levels')
  async getLevels(@CurUser() user: User) {
    const res = await this.userService.getUserOrders(user.id);

    return res.map((order) => order.levelName);
  }

  @Get('/completed-days')
  async getCompletedDaysInLevel(
    @Query('levelName') levelName: Level_Name,
    @CurUser() user: User,
  ) {
    const res = this.userService.getCompletedDaysInLevel(user.id, levelName);
    return res;
  }

  @Get('/completed-tasks')
  async getCompletedTasksInDay(
    @Query() userTask: UserTask,
    @CurUser('id') userId: number,
  ) {
    const res = this.userService.getCompletedTasksInDay(
      userId,
      userTask.levelName,
      Number(userTask.day),
    );

    return res;
  }

  // create user by admin
  @Post('/')
  @UseGuards(AdminGuard)
  createUser(@Body() createUserDto: SignUpDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Get('/:id')
  @UseGuards(AdminGuard)
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.userService.findById(id);
    return user;
  }

  @Put('/:id')
  @UseGuards(AdminGuard)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');

    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete('/:id')
  @UseGuards(AdminGuard)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return await this.userService.deleteUser(id);
  }

  @Post('/complete-day')
  async markDayAsCompleted(@Body() finishDay: UserFinishDay, @Req() req) {
    if (finishDay.day > 50) {
      throw new ForbiddenException('Day cannot be greater than 50');
    }
    return await this.userService.markDayAsCompleted(
      req.user.id,
      finishDay.levelName,
      finishDay.day,
    );
  }

  @Post('/complete-task')
  async markTaskAsCompleted(@Body() taskFinished: UserTask, @Req() req) {
    try {
      if (!taskFinished.day || taskFinished.day < 1) {
        throw new BadRequestException('Day must be a positive number');
      }

      if (taskFinished.day > 50) {
        throw new BadRequestException('Day cannot be greater than 50');
      }

      if (!taskFinished.levelName || !taskFinished.taskName) {
        throw new BadRequestException('Level name and task name are required');
      }

      const result = await this.userService.markTaskAsCompleted(
        req.user.id,
        taskFinished.levelName,
        Number(taskFinished.day),
        taskFinished.taskName,
      );

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to mark task as completed',
      );
    }
  }
}
