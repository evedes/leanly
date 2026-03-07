import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApprovalsService } from './approvals.service.js';
import { ApprovalDecisionDto } from './dto/approval-decision.dto.js';
import { CurrentUser, type ClerkUser } from '../auth/index.js';
import { WorkspacesService } from '../workspaces/index.js';

@Controller()
export class ApprovalsController {
  constructor(
    private readonly approvalsService: ApprovalsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  private async resolveWorkspace(workspaceId: string, user: ClerkUser) {
    return this.workspacesService.findOne(workspaceId, user.userId);
  }

  @Get('approvals')
  async listPendingReview(
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.approvalsService.listPendingReview(workspaceId);
  }

  @Post('tasks/:taskId/approve')
  async approve(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() dto: ApprovalDecisionDto,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.approvalsService.submitDecision(
      taskId, workspaceId, user.userId, 'approved', dto.comment,
    );
  }

  @Post('tasks/:taskId/reject')
  async reject(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() dto: ApprovalDecisionDto,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.approvalsService.submitDecision(
      taskId, workspaceId, user.userId, 'rejected', dto.comment,
    );
  }

  @Post('tasks/:taskId/request-changes')
  async requestChanges(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() dto: ApprovalDecisionDto,
    @CurrentUser() user: ClerkUser,
  ) {
    await this.resolveWorkspace(workspaceId, user);
    return this.approvalsService.submitDecision(
      taskId, workspaceId, user.userId, 'changes_requested', dto.comment,
    );
  }
}
