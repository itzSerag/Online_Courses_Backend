import { Injectable, ConflictException, ForbiddenException, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { LoginDto, PayLoad, SignUpDto } from './dto';
import { EmailService } from './auth.email.service';
import { OtpService } from './auth.otp.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
    private readonly configService: ConfigService,
  ) { }

  async isVerified(email: string) {
    const user = await this.userService.findByEmail(email);
    if (user.isVerified) {
      return true;
    }
    return false;
  }

  private async validateUser(
    email: string,
    userPassword: string,
  ) {

    try {
      const user = await this.userService.findByEmail(email);

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(userPassword, user.password);

      if (!isPasswordValid) {
        return null;
      }

      const payload: PayLoad = {
        email: user.email,
        roles: user.role,
        sub: user.id,
      };

      const jwt = await this.generateToken(payload);

      // if (!user.isVerified) {
      //   throw new ForbiddenException({
      //     message: 'Please verify your account by entering the OTP',
      //     access_token: jwt,
      //   });
      // }

      return {
        user: await this.sanitizedUser(user),
        access_token: jwt
      }

    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Authentication failed');
    }
  }

  /// UTILS -- generate and create otp
  async generateOTP(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.otpService.createOtp(email, otp);
    return otp;
  }

  async signup(user: SignUpDto) {
    try {
      const existingUser = await this.userService.findByEmail(user.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const newUser = await this.userService.createUser(user);
      const payload: PayLoad = {
        email: newUser.email,
        sub: newUser.id,
        roles: newUser.role,
      };

      const jwt = await this.generateToken(payload);
      this.logger.log(`User signed up successfully: ${newUser.email}`);

      return {
        access_token: jwt,
        user: await this.sanitizedUser(newUser),
      };
    } catch (error) {
      this.logger.error(`Signup failed: ${error.message}`);
      throw error;
    }
  }

  async login(userLoginDto: LoginDto): Promise<any> {
    try {
      const user = await this.userService.findByEmail(userLoginDto.email);
      if (!user) {
        throw new ForbiddenException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(userLoginDto.password, user.password);
      if (!isPasswordValid) {
        throw new ForbiddenException('Invalid credentials');
      }

      const payload: PayLoad = {
        email: user.email,
        roles: user.role,
        sub: user.id,
      };

      const jwt = await this.generateToken(payload);
      this.logger.log(`User logged in successfully: ${user.email}`);

      return {
        user: await this.sanitizedUser(user),
        access_token: jwt,
      };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      throw error;
    }
  };

  async resetPassword(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new ConflictException('User with this email does not exist');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await this.userService.updateUser(user.id, { password: hashedPassword });
      return { message: 'Password updated successfully' };
    } catch (err) {
      throw new ConflictException('Failed to update password');
    }
  }

  async resendOtp(userEmail: string) {

    // delete the previous otp record
    await this.otpService.deleteOtp(userEmail);

    // TODO : EMAIL SERVICE
    // const emailResponse = await this.emailService.sendEmail(email, otp);
    //await this.generateOTP(userEmail);
    // log(emailResponse);

    return { message: 'OTP sent successfully' };
  }

  async __findOrCreateOAuthUser(profile: any) {
    let user = await this.userService.findByEmail(profile.email);

    if (!user) {
      user = await this.userService.createUser({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        // Use Facebook ID as password -- gonna be hashed also
        password: profile.facebookId || profile.googleId,
        strategy: profile.provider,
        isVerified: true,
      });
    } else if (user.strategy !== profile.provider) {
      throw new ConflictException(
        'Email already in use with another sign-in/up method',
      );
    }

    return this.sanitizedUser(user);
  }

  async generateToken(user: PayLoad) {
    return this.jwtService.sign(user, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '60d',
    });
  }

  async verifyOtp(otp: string, user: any) {
    const otpRecord = await this.otpService.getOtp(user.email);
    const userRecord = await this.userService.findByEmail(user.email);

    if (!otpRecord || otpRecord !== otp) {
      throw new ConflictException('OTP is incorrect');
    }

    // PROMISE ALL
    await this.otpService.deleteOtp(user.email);
    await this.userService.updateUser(userRecord.id, {
      isVerified: true,
    });

    return { message: 'OTP is correct', user: user };
  }

  async logout() {
    // destroy the token
    return { message: 'Logged out successfully' };
  }


  private async sanitizedUser(user: User) {

    delete user.password;
    return user;
  }
}
