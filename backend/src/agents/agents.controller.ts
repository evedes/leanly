import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AgentsService } from './agents.service.js';
import { CreateAgentDto } from './dto/create-agent.dto.js';
import { UpdateAgentDto } from './dto/update-agent.dto.js';
import { CreateAgentKeyDto } from './dto/create-agent-key.dto.js';
import { CurrentUser, type ClerkUser } from '../auth/index.js';
import { WorkspacesService } from '../workspaces/index.js';

@Controller('agents')
export class AgentsController {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  private async resolveWorkspace(workspaceId: string, user: ClerkUser) {
    return this.workspacesService.findOne(workspaceId, user.userId);
  }

  @Post()
  async create(
    @Body() dto: CreateAgentDto,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.agentsService.create(dto.name, workspaceId);
  }

  @Get()
  async findAll(
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.agentsService.findAll(workspaceId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.agentsService.findOne(id, workspaceId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAgentDto,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.agentsService.update(id, workspaceId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    await this.agentsService.remove(id, workspaceId);
  }

  @Post(':id/keys')
  async createKey(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAgentKeyDto,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.agentsService.createKey(id, workspaceId, dto.name);
  }

  @Delete(':id/keys/:keyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeKey(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('keyId', ParseUUIDPipe) keyId: string,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    await this.agentsService.revokeKey(id, keyId, workspaceId);
  }
}
