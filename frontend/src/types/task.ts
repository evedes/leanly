export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'approved' | 'rejected';
export type AssigneeType = 'human' | 'agent';

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigneeType: AssigneeType | null;
  assigneeId: string | null;
  autonomyLevel: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'approved', 'rejected'];

export const AUTONOMY_LABELS: Record<number, string> = {
  0: 'Step by step',
  1: 'Checkpoint',
  2: 'Autonomous',
};

export type TraceType = 'reasoning' | 'tool_call' | 'output' | 'error';

export interface Trace {
  id: string;
  taskId: string;
  agentId: string;
  type: TraceType;
  content: Record<string, unknown>;
  tokenCount: number | null;
  timestamp: string;
}

export interface Approval {
  id: string;
  taskId: string;
  reviewerId: string;
  decision: 'approved' | 'rejected' | 'changes_requested';
  comment: string | null;
  createdAt: string;
}

export interface TaskWithDetails extends Task {
  traces: Trace[];
  approvals?: Approval[];
}
