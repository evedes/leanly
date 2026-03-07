import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, gt, asc, sql } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../database/index.js';
import { traces, tasks } from '../database/schema/index.js';

@Injectable()
export class TracesService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(
    taskId: string,
    agentId: string,
    workspaceId: string,
    data: {
      type: 'reasoning' | 'tool_call' | 'output' | 'error';
      content: Record<string, unknown>;
      token_count?: number;
    },
  ) {
    // Verify task exists and belongs to workspace
    const [task] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)));

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const [trace] = await this.db
      .insert(traces)
      .values({
        taskId,
        agentId,
        type: data.type,
        content: data.content,
        tokenCount: data.token_count ?? null,
      })
      .returning();

    return trace;
  }

  async findAllByTask(
    taskId: string,
    workspaceId: string,
    options: { cursor?: string; limit?: number } = {},
  ) {
    const limit = Math.min(options.limit ?? 50, 100);

    // Verify task exists and belongs to workspace
    const [task] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId)));

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const conditions = [eq(traces.taskId, taskId)];

    if (options.cursor) {
      conditions.push(gt(traces.id, options.cursor));
    }

    const items = await this.db
      .select()
      .from(traces)
      .where(and(...conditions))
      .orderBy(asc(traces.timestamp), asc(traces.id))
      .limit(limit + 1);

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    // Get aggregate token count
    const [aggregate] = await this.db
      .select({ totalTokens: sql<number>`coalesce(sum(${traces.tokenCount}), 0)` })
      .from(traces)
      .where(eq(traces.taskId, taskId));

    return {
      data,
      pagination: {
        next_cursor: nextCursor,
        has_more: hasMore,
      },
      total_token_count: Number(aggregate.totalTokens),
    };
  }
}
