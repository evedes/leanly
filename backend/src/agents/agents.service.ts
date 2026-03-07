import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../database/index.js';
import { agents, apiKeys } from '../database/schema/index.js';
import { ApiKeysService } from '../api-keys/api-keys.service.js';

@Injectable()
export class AgentsService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  async create(name: string, workspaceId: string) {
    const [agent] = await this.db
      .insert(agents)
      .values({ name, workspaceId })
      .returning();

    const key = await this.apiKeysService.create(
      `${name} default key`,
      workspaceId,
      agent.id,
    );

    return { agent, apiKey: { id: key.id, key: key.plainTextKey, keyPrefix: key.keyPrefix, name: key.name } };
  }

  async findAll(workspaceId: string) {
    return this.db
      .select()
      .from(agents)
      .where(eq(agents.workspaceId, workspaceId));
  }

  async findOne(id: string, workspaceId: string) {
    const [agent] = await this.db
      .select()
      .from(agents)
      .where(and(eq(agents.id, id), eq(agents.workspaceId, workspaceId)));

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return agent;
  }

  async update(
    id: string,
    workspaceId: string,
    data: { name?: string; status?: 'active' | 'inactive' },
  ) {
    await this.findOne(id, workspaceId);

    const [updated] = await this.db
      .update(agents)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(agents.id, id), eq(agents.workspaceId, workspaceId)))
      .returning();

    return updated;
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);

    // Revoke all active keys for this agent
    await this.db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(apiKeys.agentId, id),
          eq(apiKeys.workspaceId, workspaceId),
          isNull(apiKeys.revokedAt),
        ),
      );

    // Deactivate the agent
    const [updated] = await this.db
      .update(agents)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(and(eq(agents.id, id), eq(agents.workspaceId, workspaceId)))
      .returning();

    return updated;
  }

  async listKeys(agentId: string, workspaceId: string) {
    await this.findOne(agentId, workspaceId);

    return this.db
      .select({
        id: apiKeys.id,
        keyPrefix: apiKeys.keyPrefix,
        name: apiKeys.name,
        createdAt: apiKeys.createdAt,
        lastUsedAt: apiKeys.lastUsedAt,
        revokedAt: apiKeys.revokedAt,
      })
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.agentId, agentId),
          eq(apiKeys.workspaceId, workspaceId),
          isNull(apiKeys.revokedAt),
        ),
      );
  }

  async createKey(agentId: string, workspaceId: string, name: string) {
    await this.findOne(agentId, workspaceId);

    const key = await this.apiKeysService.create(name, workspaceId, agentId);

    return { id: key.id, key: key.plainTextKey, keyPrefix: key.keyPrefix, name: key.name };
  }

  async revokeKey(agentId: string, keyId: string, workspaceId: string) {
    await this.findOne(agentId, workspaceId);

    const [key] = await this.db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.id, keyId),
          eq(apiKeys.agentId, agentId),
          eq(apiKeys.workspaceId, workspaceId),
          isNull(apiKeys.revokedAt),
        ),
      );

    if (!key) {
      throw new NotFoundException('API key not found or already revoked');
    }

    await this.db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(eq(apiKeys.id, keyId));

    return { revoked: true };
  }
}
