import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';

@Injectable()
export class IsVerifiedGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Ensure user is attached to the request (this should be done by the AuthMiddleware/Guard)
    const user = request.user as User;

    if (!user) {
      throw new UnauthorizedException('User not authenticated.');
    }


    if (!user.isVerified) {
      throw new ForbiddenException('Account is not verified.');
    }

    return true;
  }
}
