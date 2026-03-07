import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/index.js';
import { ClerkAuthGuard } from './auth/index.js';
import { ApiKeysModule } from './api-keys/index.js';
import { WorkspacesModule } from './workspaces/index.js';
import { AgentsModule } from './agents/index.js';
import { TracesModule } from './traces/index.js';
import { TasksModule } from './tasks/index.js';

@Module({
  imports: [DatabaseModule, ApiKeysModule, WorkspacesModule, AgentsModule, TracesModule, TasksModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ClerkAuthGuard },
  ],
})
export class AppModule {}
