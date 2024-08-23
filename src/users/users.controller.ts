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
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { UsersService } from './users.service';
import { SignUpDto, UpdateUserDto } from '../auth/dto';
import { UserWithoutPassword as User } from './types'; // Assuming you have a User entity

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

  @Post('/')
  @UseGuards(AdminGuard)
  createUser(@Body() createUserDto: SignUpDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Get('/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Put('/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (user.id !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException('You are not allowed to update this user');
    }

    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete('/:id')
  @UseGuards(AdminGuard)
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.userService.deleteUser(id);
  }
}
