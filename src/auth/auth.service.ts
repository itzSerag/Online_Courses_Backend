import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { PayLoad, SignUpDto } from './dto';
import { UserWithoutPassword } from 'src/users/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      /// destructuring the password from the user object
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

    const payload: PayLoad = {
      email: newUser.email,
      sub: newUser.id,
      roles: newUser.role,
    };

    const jwt = await this.generateToken(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = newUser;

    return {
      access_token: jwt,
      user: userWithoutPassword,
    };
  }

  async login(user: any): Promise<any> {
    const payload: PayLoad = {
      email: user.email,
      sub: user.id,
      roles: user.role,
    };

    return {
      access_token: await this.generateToken(payload),
      user,
    };
  }

  async findOrCreateOAuthUser(profile: any) {
    let user = await this.userService.findByEmail(profile.email);

    if (!user) {
      user = await this.userService.createUser({
        email: profile.email,
        username: profile.firstName,
        // Use Facebook ID as password -- gonna be hashed also
        password: profile.facebookId || profile.googleId,
      });
    }
    return user;
  }

  async generateToken(user: PayLoad) {
    return this.jwtService.sign(user);
  }
}
