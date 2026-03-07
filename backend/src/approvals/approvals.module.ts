import { Module } from '@nestjs/common';
import { ApprovalsController } from './approvals.controller.js';
import { ApprovalsService } from './approvals.service.js';
import { TasksModule } from '../tasks/index.js';
import { WorkspacesModule } from '../workspaces/index.js';

@Module({
  imports: [TasksModule, WorkspacesModule],
  controllers: [ApprovalsController],
  providers: [ApprovalsService],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
