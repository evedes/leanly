import { Inject, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { eq, and, isNull } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../database/index.js';
import { apiKeys } from '../database/schema/index.js';

export interface CreateApiKeyResult {
  id: string;
  plainTextKey: string;
  keyPrefix: string;
  name: string;
}

export interface ApiKeyIdentity {
  agentId: string;
  workspaceId: string;
  apiKeyId: string;
}

@Injectable()
export class ApiKeysService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  static hashKey(plainTextKey: string): string {
    return createHash('sha256').update(plainTextKey).digest('hex');
  }

  static generateKey(): string {
    const random = randomBytes(32).toString('base64url');
    return `lnly_${random}`;
  }

  async create(
    name: string,
    workspaceId: string,
    agentId: string,
  ): Promise<CreateApiKeyResult> {
    const plainTextKey = ApiKeysService.generateKey();
    const keyHash = ApiKeysService.hashKey(plainTextKey);
    const keyPrefix = plainTextKey.slice(0, 12);

    const [row] = await this.db
      .insert(apiKeys)
      .values({ keyHash, keyPrefix, name, workspaceId, agentId })
      .returning({ id: apiKeys.id });

    return { id: row.id, plainTextKey, keyPrefix, name };
  }

  async validate(plainTextKey: string): Promise<ApiKeyIdentity | null> {
    const keyHash = ApiKeysService.hashKey(plainTextKey);

    const [row] = await this.db
      .select({
        id: apiKeys.id,
        agentId: apiKeys.agentId,
        workspaceId: apiKeys.workspaceId,
      })
      .from(apiKeys)
      .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)));

    if (!row) return null;

    // Fire-and-forget last used update
    this.db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, row.id))
      .then(() => {})
      .catch(() => {});

    return {
      apiKeyId: row.id,
      agentId: row.agentId,
      workspaceId: row.workspaceId,
    };
  }

  async listByWorkspace(workspaceId: string) {
    return this.db
      .select({
        id: apiKeys.id,
        keyPrefix: apiKeys.keyPrefix,
        name: apiKeys.name,
        agentId: apiKeys.agentId,
        createdAt: apiKeys.createdAt,
        lastUsedAt: apiKeys.lastUsedAt,
        revokedAt: apiKeys.revokedAt,
      })
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.workspaceId, workspaceId),
          isNull(apiKeys.revokedAt),
        ),
      );
  }

  async revoke(id: string, workspaceId: string): Promise<boolean> {
    const result = await this.db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(apiKeys.id, id),
          eq(apiKeys.workspaceId, workspaceId),
          isNull(apiKeys.revokedAt),
        ),
      )
      .returning({ id: apiKeys.id });

    return result.length > 0;
  }
}
