import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signup(user: SignUpDto) {
    const existingUser = await this.userService.findByEmail(user.email);
    if (existingUser) {
      /// conflict exception for duplicate user
      throw new ConflictException('User already exists');
    }

    const newUser = await this.userService.createUser(user);
    return this.login(newUser);
  }

  async login(user: {
    email: string;
    role: 'USER' | 'ADMIN';
    id: string;
  }): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.id, roles: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async findOrCreateOAuthUser(profile: any) {
    let user = await this.userService.findByEmail(profile.email);
    if (!user) {
      user = await this.userService.createUser({
        email: profile.email,
        username: profile.firstName,
        password: profile.facebookId,
        // Add other fields as necessary
      });
    }
    return user;
  }
}
