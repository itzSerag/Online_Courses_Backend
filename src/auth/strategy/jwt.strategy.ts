import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PayLoad } from '../dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  async validate(payload: PayLoad) {
    console.log('payload', payload);

    const result = await this.userService.findByEmail(payload.email);

    if (!result) {
      return null;
    }

    if (!result.isVerified) {
      return null;
    }
    // destructuring password from the result object and returning the rest of the object
    const { password, ...userWithoutPassword } = result;

    return userWithoutPassword;
  }
}
