import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service.js';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  async create(
    @Body() body: { name: string; workspaceId: string; agentId: string },
  ) {
    const result = await this.apiKeysService.create(
      body.name,
      body.workspaceId,
      body.agentId,
    );

    return {
      id: result.id,
      key: result.plainTextKey,
      keyPrefix: result.keyPrefix,
      name: result.name,
    };
  }

  @Get('workspace/:workspaceId')
  async list(@Param('workspaceId') workspaceId: string) {
    return this.apiKeysService.listByWorkspace(workspaceId);
  }

  @Delete(':id')
  async revoke(
    @Param('id') id: string,
    @Body() body: { workspaceId: string },
  ) {
    const revoked = await this.apiKeysService.revoke(id, body.workspaceId);
    if (!revoked) {
      throw new NotFoundException('API key not found or already revoked');
    }
    return { revoked: true };
  }
}
