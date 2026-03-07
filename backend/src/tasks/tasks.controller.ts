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
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { RespondInputDto } from './dto/respond-input.dto.js';
import { CurrentUser, type ClerkUser } from '../auth/index.js';
import { WorkspacesService } from '../workspaces/index.js';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  private async resolveWorkspace(workspaceId: string, user: ClerkUser) {
    return this.workspacesService.findOne(workspaceId, user.userId);
  }

  @Post()
  async create(
    @Body() dto: CreateTaskDto,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.tasksService.create(workspaceId, user.userId, dto);
  }

  @Get()
  async findAll(
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
    @Query('status') status?: string,
    @Query('assignee_type') assigneeType?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.tasksService.findAll(workspaceId, {
      status: status as any,
      assignee_type: assigneeType as any,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.tasksService.findOneWithTraces(id, workspaceId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.tasksService.update(id, workspaceId, dto);
  }

  @Post(':id/respond')
  async respond(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RespondInputDto,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.tasksService.respondToInputRequest(id, workspaceId, dto.response, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    await this.tasksService.remove(id, workspaceId);
  }
}
