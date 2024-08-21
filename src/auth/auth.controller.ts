import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, PayLoad, SignUpDto } from './dto';
import { JwtAuthGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    

    const user = await this.authService.validateUser(body.email, body.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Post('signup')
  async signup(@Body() body: SignUpDto): Promise<any> {
    return this.authService.signup(body);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginCallback(@Req() req): Promise<any> {
    const user = await this.authService.findOrCreateOAuthUser(req.user);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: PayLoad = {
      email: user.email,
      sub: user.id,
      roles: user.role,
    };

    const jwt = await this.authService.generateToken(payload);
    return { access_token: jwt, user, provider: req.user.provider };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req): Promise<any> {
    if (!req.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.authService.findOrCreateOAuthUser(req.user);

    const payload: PayLoad = {
      email: user.email,
      sub: user.id,
      roles: user.role,
    };

    const jwt = await this.authService.generateToken(payload);

    return {
      access_token: jwt,
      user,
      provider: req.user.provider,
    };
  }

  @Post('verify-otp')
  @UseGuards(JwtAuthGuard)
  async verifyOtp(@Body('otp') otp: string, @Req() req) {


    const result = await this.authService.verifyOtp(otp, req.user);

    return result;
  }
}
