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
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { UsersService } from './users.service';
import { SignUpDto, UpdateUserDto } from '../auth/dto';
import { UserWithoutPassword as User } from './types'; // Assuming you have a User entity
import { UserFinishDay, UserTask } from './dto';
import { Level_Name } from '../shared/enums';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('/me')
  getMe(@Req() req): User {
    return req.user;
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
  async getLevels(@Req() req) {
    const res = await this.userService.getUserOrders(req.user.id);

    return res.map((order) => order.levelName);
  }

  @Get('/completed-days')
  async getCompletedDaysInLevel(
    @Query('levelName') levelName: Level_Name,
    @Req() req,
  ) {
    console.log('into this');
    const res = this.userService.getCompletedDaysInLevel(
      req.user.id,
      levelName,
    );
    return res;
  }

  @Get('/completed-tasks')
  async getCompletedTasksInDay(@Query() userTask: UserTask, @Req() req) {
    const res = this.userService.getCompletedTasksInDay(
      req.user.id,
      userTask.levelName,
      Number(userTask.day),
    );

    return res;
  }
  @Post('/')
  @UseGuards(AdminGuard)
  createUser(@Body() createUserDto: SignUpDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Get('/:id')
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
    if (taskFinished.day > 50) {
      throw new ForbiddenException('Day cannot be greater than 50');
    }
    const res = await this.userService.markTaskAsCompleted(
      req.user.id,
      taskFinished.levelName,
      Number(taskFinished.day),
      taskFinished.taskName,
    );

    return res;
  }
}
