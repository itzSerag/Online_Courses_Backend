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

    // Ensure user is attached to the request (this should be done by the AuthMiddleware/Guard)
    const user = request.user as UserWithId;

    // Log the user for debugging
    console.log('user from request:', user);

    if (!user) {
      console.log('User not found in request.');
      throw new UnauthorizedException('User not authenticated.');
    }

    console.log('User verified:', user.isVerified);

    if (!user.isVerified) {
      throw new ForbiddenException('Account is not verified.');
    }

    return true;
  }
}
