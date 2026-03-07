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
