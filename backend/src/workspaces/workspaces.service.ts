import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../database/index.js';
import { workspaces } from '../database/schema/index.js';

@Injectable()
export class WorkspacesService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(name: string, orgId: string) {
    const [workspace] = await this.db
      .insert(workspaces)
      .values({ name, orgId })
      .returning();

    return workspace;
  }

  async findOne(id: string, orgId: string) {
    const [workspace] = await this.db
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.id, id)));

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.orgId !== orgId) {
      throw new ForbiddenException('Access denied');
    }

    return workspace;
  }

  async update(id: string, orgId: string, data: { name?: string }) {
    const workspace = await this.findOne(id, orgId);

    const [updated] = await this.db
      .update(workspaces)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workspaces.id, workspace.id))
      .returning();

    return updated;
  }

  async remove(id: string, orgId: string) {
    const workspace = await this.findOne(id, orgId);

    await this.db.delete(workspaces).where(eq(workspaces.id, workspace.id));
  }
}
