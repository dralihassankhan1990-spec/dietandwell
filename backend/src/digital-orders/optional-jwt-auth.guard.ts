import { Injectable, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Like JwtAuthGuard, but a missing/invalid token is NOT an error —
 * req.user is simply left undefined. Used for endpoints that are public
 * but attach the user when a valid JWT happens to be present.
 */
@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch {
      return true;
    }
  }
}
