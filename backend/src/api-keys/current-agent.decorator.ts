import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AgentIdentity {
  agentId: string;
  workspaceId: string;
  apiKeyId: string;
}

export const CurrentAgent = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AgentIdentity => {
    const request = ctx.switchToHttp().getRequest();
    return request.agent;
  },
);
