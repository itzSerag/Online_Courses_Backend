import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  NotFoundException,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Query,
  BadRequestException,
  InternalServerErrorException,
  ValidationPipe,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { UsersService } from './users.service';
import { SignUpDto, UpdateUserDto } from '../auth/dto';
import { CurUser } from './decorators/get-user.decorator';
import { GetCompletedDaysDto, GetCompletedTasksDto, UserFinishDayDto, UserTaskDto } from './dto';
import { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  @ApiOperation({ summary: 'Get current user details' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully.' })
  @Get('/me')
  getMe(@CurUser() user: User): User {
    return user;
  }

  @ApiOperation({ summary: 'Get user by email (Admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get('email/:email')
  @UseGuards(AdminGuard)
  async getUserByEmail(@Param('email') email: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all users retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin access required.' })
  @Get('/all')
  @UseGuards(AdminGuard)
  async getAllUsers(): Promise<User[]> {
    return this.userService.findAllUsers();
  }

  @ApiOperation({ summary: 'Get levels purchased by the user' })
  @ApiResponse({ status: 200, description: 'List of levels retrieved successfully.' })
  @Get('/levels')
  async getLevels(@CurUser('id') userId: number) {
    const orders = await this.userService.getUserCompletedOrders(userId);
    return orders.map((order) => order.levelName);
  }

  @ApiOperation({ summary: 'Get completed days in a level' })
  @ApiResponse({ status: 200, description: 'List of completed days retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request. Invalid input.' })
  @Get('/completed-days')
  async getCompletedDaysInLevel(
    @Query(ValidationPipe) dto: GetCompletedDaysDto,
    @CurUser('id') userId: number,
  ) {
    return this.userService.getCompletedDaysInLevel(userId, dto.levelName);
  }

  @ApiOperation({ summary: 'Get completed tasks in a day' })
  @ApiResponse({ status: 200, description: 'List of completed tasks retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request. Invalid input.' })
  @Get('/completed-tasks')
  async getCompletedTasksInDay(
    @Query(ValidationPipe) dto: GetCompletedTasksDto,
    @CurUser('id') userId: number,
  ) {
    return this.userService.getCompletedTasksInDay(
      userId,
      dto.levelName,
      dto.day,
    );
  }

  @Post('/')
  @UseGuards(AdminGuard)
  async createUser(@Body(ValidationPipe) createUserDto: SignUpDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Get('/:id')
  @UseGuards(AdminGuard)
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Put('/:id')
  @UseGuards(AdminGuard)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete('/:id')
  @UseGuards(AdminGuard)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userService.deleteUser(id);
  }

  @ApiOperation({ summary: 'Mark a day as completed' })
  @ApiResponse({ status: 200, description: 'Day marked as completed successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request. Invalid input.' })
  @Post('/complete-day')
  async markDayAsCompleted(
    @Body(ValidationPipe) finishDayDto: UserFinishDayDto,
    @CurUser('id') userId: number,
  ) {
    try {
      return await this.userService.markDayAsCompleted(
        userId,
        finishDayDto.levelName,
        finishDayDto.day,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to mark day as completed');
    }
  }

  @ApiOperation({ summary: 'Mark a task as completed' })
  @ApiResponse({ status: 200, description: 'Task marked as completed successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request. Invalid input.' })
  @Post('/complete-task')
  async markTaskAsCompleted(
    @Body(ValidationPipe) taskDto: UserTaskDto,
    @CurUser('id') userId: number,
  ) {
    try {
      return await this.userService.markTaskAsCompleted(
        userId,
        taskDto.levelName,
        taskDto.day,
        taskDto.taskName,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to mark task as completed');
    }
  }
}