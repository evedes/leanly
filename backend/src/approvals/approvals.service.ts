import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { eq, and, asc } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../database/index.js';
import { approvals, tasks } from '../database/schema/index.js';
import { TasksService } from '../tasks/index.js';

type ApprovalDecision = 'approved' | 'rejected' | 'changes_requested';

@Injectable()
export class ApprovalsService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private readonly tasksService: TasksService,
  ) {}

  async listPendingReview(workspaceId: string) {
    return this.db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.workspaceId, workspaceId),
          eq(tasks.status, 'in_review'),
        ),
      )
      .orderBy(asc(tasks.updatedAt));
  }

  async submitDecision(
    taskId: string,
    workspaceId: string,
    reviewerId: string,
    decision: ApprovalDecision,
    comment?: string,
  ) {
    const task = await this.tasksService.findOne(taskId, workspaceId);

    if (task.status !== 'in_review') {
      throw new BadRequestException('Task is not in review');
    }

    const newStatus = decision === 'approved' ? 'approved' : 'in_progress';

    const [approval] = await this.db
      .insert(approvals)
      .values({
        taskId,
        reviewerId,
        decision,
        comment,
      })
      .returning();

    await this.db
      .update(tasks)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(tasks.id, taskId));

    return approval;
  }
}
