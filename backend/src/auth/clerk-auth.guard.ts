import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/backend';
import { IS_PUBLIC_KEY } from './public.decorator.js';
import { IS_AGENT_ENDPOINT } from '../api-keys/api-key-auth.guard.js';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const isAgentEndpoint = this.reflector.getAllAndOverride<boolean>(
      IS_AGENT_ENDPOINT,
      [context.getHandler(), context.getClass()],
    );
    if (isAgentEndpoint) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      request.user = {
        userId: payload.sub,
        sessionId: payload.sid,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid session token');
    }
  }
}
