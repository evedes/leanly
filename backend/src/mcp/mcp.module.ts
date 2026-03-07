import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller.js';
import { McpService } from './mcp.service.js';
import { TasksModule } from '../tasks/index.js';
import { TracesModule } from '../traces/index.js';
import { ApiKeysModule } from '../api-keys/index.js';

@Module({
  imports: [TasksModule, TracesModule, ApiKeysModule],
  controllers: [McpController],
  providers: [McpService],
})
export class McpModule {}
