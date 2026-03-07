import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller.js';
import { AgentsService } from './agents.service.js';
import { ApiKeysModule } from '../api-keys/index.js';
import { WorkspacesModule } from '../workspaces/index.js';

@Module({
  imports: [ApiKeysModule, WorkspacesModule],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
