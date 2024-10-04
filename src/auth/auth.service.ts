import {
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { PayLoad, SignUpDto } from './dto';
import { UserWithoutPassword } from 'src/users/types';
import { EmailService } from './auth.email.service';
import { OtpService } from './auth.otp.service';
import { log } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
  ) {}

  async isVerified(email: string) {
    const user = await this.userService.findByEmail(email);
    if (user.isVerified) {
      return true;
    }
    return false;
  }

  async validateUser(
    email: string,
    userPassword: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(userPassword, user.password);
    log(isPasswordValid);
    if (user && !isPasswordValid) {
      return null;
    }

    const payload: PayLoad = {
      email: user.email,
      roles: user.role,
      sub: user.id,
    };

    const jwt = await this.generateToken(payload);

    if (!user.isVerified) {
      throw new ForbiddenException({
        message: 'Account not verified please enter the otp',
        access_token: jwt,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /// UTILS -- generate and create otp
  async generateOTP(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.otpService.createOtp(email, otp);
    return otp;
  }

  async signup(user: SignUpDto) {
    const existingUser = await this.userService.findByEmail(user.email);
    if (existingUser) {
      /// conflict exception for duplicate user
      throw new ConflictException('User with this email already exists');
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

    /// generate and create an otp record
    await this.generateOTP(user.email);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const emailResponse = await this.emailService.sendEmail(user.email, otp);

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

  async resendOtp(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new ConflictException('User with this email does not exist');
    }

    // delete the previous otp record
    await this.otpService.deleteOtp(email);

    const otp = await this.generateOTP(email);

    // const emailResponse = await this.emailService.sendEmail(email, otp);
    // log(emailResponse);

    return { message: 'OTP sent successfully' };
  }

  async findOrCreateOAuthUser(profile: any) {
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
    return user;
  }

  async generateToken(user: PayLoad) {
    return this.jwtService.sign(user);
  }

  // verifying the otp service from db and get the email from the req.user
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
}
