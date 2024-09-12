import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserWithId } from 'src/users/types';

@Injectable()
export class IsVerifiedGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserWithId;

    if (!user) {
      throw new UnauthorizedException();
    }

    const isVerified = await this.authService.isVerified(user.email);

    if (!isVerified) {
      throw new ForbiddenException('Account is not verified');
    }

    return true;
  }
}
