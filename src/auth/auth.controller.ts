import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  HttpStatus,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, PayLoad, SignUpDto } from './dto';
import { JwtAuthGuard } from './guard';
import { IsVerifiedGuard } from './guard/isVerified.guard';
import { Request, Response } from 'express';
import { CurUser } from 'src/users/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  async login(@Body() userLoginDto: LoginDto) {

    return this.authService.login(userLoginDto);
  }

  @Post('signup')
  async signup(@Body() body: SignUpDto): Promise<any> {
    return this.authService.signup(body);
  }

  @Post('reset-password')
  @UseGuards(IsVerifiedGuard)
  @UseGuards(JwtAuthGuard)
  async resetPassword(@Body('password') password: string, @CurUser() user: User) {
    return await this.authService.resetPassword(user.email, password);
  }

  @Post('resend-otp')
  @UseGuards(JwtAuthGuard)
  async resendOtp(@CurUser() user: User) {
    return this.authService.resendOtp(user.email);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginCallback(@Req() req, @Res() res: Response): Promise<any> {
    const user = await this.authService.__findOrCreateOAuthUser(req.user);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: PayLoad = {
      email: user.email,
      sub: user.id,
      roles: user.role,
    };

    const jwt = await this.authService.generateToken(payload);
    res.redirect(`${process.env.WEBSITE_URL}/ar/callback?token=${jwt}`);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    if (!req.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.authService.__findOrCreateOAuthUser(req.user);

    const payload: PayLoad = {
      email: user.email,
      sub: user.id,
      roles: user.role,
    };

    const jwt = await this.authService.generateToken(payload);

    res.redirect(`${process.env.WEBSITE_URL}/ar/callback?token=${jwt}`);
  }

  @Post('verify-otp')
  @UseGuards(JwtAuthGuard)
  async verifyOtp(@Body('otp') otp: string, @Req() req) {
    const result = await this.authService.verifyOtp(otp, req.user);

    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {
    return this.authService.logout();
  }
}
