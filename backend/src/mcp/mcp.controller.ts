import {
  All,
  Controller,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpService } from './mcp.service.js';
import { ApiKeyAuthGuard } from '../api-keys/index.js';
import { AgentEndpoint } from '../api-keys/index.js';

@Controller('mcp')
@AgentEndpoint()
@UseGuards(ApiKeyAuthGuard)
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @All()
  async handleMcp(@Req() req: Request, @Res() res: Response) {
    const agent = (req as any).agent;
    await this.mcpService.handleRequest(req, res, agent);
  }
}
