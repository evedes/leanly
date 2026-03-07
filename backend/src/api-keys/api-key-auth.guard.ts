import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../auth/public.decorator.js';
import { ApiKeysService } from './api-keys.service.js';

export const IS_AGENT_ENDPOINT = 'isAgentEndpoint';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private apiKeysService: ApiKeysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    if (!token.startsWith('lnly_')) {
      throw new UnauthorizedException('Invalid API key format');
    }

    const identity = await this.apiKeysService.validate(token);
    if (!identity) {
      throw new UnauthorizedException('Invalid or revoked API key');
    }

    request.agent = {
      agentId: identity.agentId,
      workspaceId: identity.workspaceId,
      apiKeyId: identity.apiKeyId,
    };

    return true;
  }
}
