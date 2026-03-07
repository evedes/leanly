import { Module } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service.js';
import { ApiKeysController } from './api-keys.controller.js';
import { ApiKeyAuthGuard } from './api-key-auth.guard.js';

@Module({
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeyAuthGuard],
  exports: [ApiKeysService, ApiKeyAuthGuard],
})
export class ApiKeysModule {}
