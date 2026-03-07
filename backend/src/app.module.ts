import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/index.js';
import { ClerkAuthGuard } from './auth/index.js';
import { ApiKeysModule } from './api-keys/index.js';

@Module({
  imports: [DatabaseModule, ApiKeysModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ClerkAuthGuard },
  ],
})
export class AppModule {}
