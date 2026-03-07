import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { TracesService } from './traces.service.js';
import { CreateTraceDto } from './dto/create-trace.dto.js';
import { AgentEndpoint, CurrentAgent, type AgentIdentity } from '../api-keys/index.js';

@AgentEndpoint()
@Controller('tasks/:taskId/traces')
export class TracesController {
  constructor(private readonly tracesService: TracesService) {}

  @Post()
  async create(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CreateTraceDto,
    @CurrentAgent() agent: AgentIdentity,
  ) {
    return this.tracesService.create(taskId, agent.agentId, agent.workspaceId, dto);
  }

  @Get()
  async findAll(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentAgent() agent: AgentIdentity,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tracesService.findAllByTask(taskId, agent.workspaceId, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
