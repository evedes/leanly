import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, gt, asc, desc, sql, type SQL } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../database/index.js';
import { tasks, traces, approvals } from '../database/schema/index.js';

type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'approved' | 'rejected';

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress'],
  in_progress: ['in_review'],
  in_review: ['approved', 'rejected'],
  approved: [],
  rejected: [],
};

@Injectable()
export class TasksService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(
    workspaceId: string,
    createdBy: string,
    data: {
      title: string;
      description?: string;
      assignee_type?: 'human' | 'agent';
      assignee_id?: string;
      autonomy_level?: number;
    },
  ) {
    const [task] = await this.db
      .insert(tasks)
      .values({
        workspaceId,
        title: data.title,
        description: data.description,
        assigneeType: data.assignee_type,
        assigneeId: data.assignee_id,
        autonomyLevel: data.autonomy_level ?? 0,
        createdBy,
      })
      .returning();

    return task;
  }

  async findAll(
    workspaceId: string,
    options: {
      status?: TaskStatus;
      assignee_type?: 'human' | 'agent';
      cursor?: string;
      limit?: number;
    } = {},
  ) {
    const limit = Math.min(options.limit ?? 20, 100);
    const conditions: SQL[] = [eq(tasks.workspaceId, workspaceId)];

    if (options.status) {
      conditions.push(eq(tasks.status, options.status));
    }

    if (options.assignee_type) {
      conditions.push(eq(tasks.assigneeType, options.assignee_type));
    }

    if (options.cursor) {
      conditions.push(gt(tasks.id, options.cursor));
    }

    const items = await this.db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(asc(tasks.createdAt), asc(tasks.id))
      .limit(limit + 1);

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      data,
      pagination: {
        next_cursor: nextCursor,
        has_more: hasMore,
      },
    };
  }

  async findOne(id: string, workspaceId: string) {
    const [task] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.workspaceId, workspaceId)));

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async findByAssignee(
    workspaceId: string,
    agentId: string,
    options: { status?: TaskStatus } = {},
  ) {
    const conditions: SQL[] = [
      eq(tasks.workspaceId, workspaceId),
      eq(tasks.assigneeType, 'agent'),
      eq(tasks.assigneeId, agentId),
    ];

    if (options.status) {
      conditions.push(eq(tasks.status, options.status));
    }

    return this.db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(asc(tasks.createdAt), asc(tasks.id));
  }

  async findOneWithTraces(id: string, workspaceId: string) {
    const task = await this.findOne(id, workspaceId);

    const taskTraces = await this.db
      .select()
      .from(traces)
      .where(eq(traces.taskId, id))
      .orderBy(asc(traces.timestamp), asc(traces.id));

    return { ...task, traces: taskTraces };
  }

  async findOneWithDetails(id: string, workspaceId: string) {
    const task = await this.findOne(id, workspaceId);

    const taskTraces = await this.db
      .select()
      .from(traces)
      .where(eq(traces.taskId, id))
      .orderBy(asc(traces.timestamp), asc(traces.id));

    const taskApprovals = await this.db
      .select()
      .from(approvals)
      .where(eq(approvals.taskId, id))
      .orderBy(desc(approvals.createdAt));

    return { ...task, traces: taskTraces, approvals: taskApprovals };
  }

  async respondToInputRequest(id: string, workspaceId: string, response: string, responderId: string) {
    const task = await this.findOne(id, workspaceId);

    if (task.status !== 'in_progress') {
      throw new BadRequestException('Task is not in progress');
    }

    // Store the response as a trace entry with reasoning type
    const [trace] = await this.db
      .insert(traces)
      .values({
        taskId: id,
        agentId: task.assigneeId!,
        type: 'reasoning',
        content: { input_response: true, response, responder_id: responderId },
      })
      .returning();

    return trace;
  }

  async update(
    id: string,
    workspaceId: string,
    data: {
      title?: string;
      description?: string;
      assignee_type?: 'human' | 'agent';
      assignee_id?: string;
      autonomy_level?: number;
      status?: TaskStatus;
    },
  ) {
    const task = await this.findOne(id, workspaceId);

    if (data.status && data.status !== task.status) {
      const allowed = VALID_TRANSITIONS[task.status as TaskStatus];
      if (!allowed.includes(data.status)) {
        throw new BadRequestException(
          `Invalid status transition from '${task.status}' to '${data.status}'`,
        );
      }
    }

    const [updated] = await this.db
      .update(tasks)
      .set({
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.assignee_type !== undefined && { assigneeType: data.assignee_type }),
        ...(data.assignee_id !== undefined && { assigneeId: data.assignee_id }),
        ...(data.autonomy_level !== undefined && { autonomyLevel: data.autonomy_level }),
        ...(data.status !== undefined && { status: data.status }),
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, id), eq(tasks.workspaceId, workspaceId)))
      .returning();

    return updated;
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);

    await this.db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.workspaceId, workspaceId)));
  }
}
