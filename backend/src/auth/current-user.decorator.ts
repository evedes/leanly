import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ClerkUser {
  userId: string;
  sessionId: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ClerkUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
