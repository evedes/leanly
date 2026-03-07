"use client";

import type { TaskStatus, AssigneeType } from '@/types/task';

interface FiltersProps {
  statusFilter: TaskStatus | '';
  assigneeTypeFilter: AssigneeType | '';
  onStatusChange: (status: TaskStatus | '') => void;
  onAssigneeTypeChange: (type: AssigneeType | '') => void;
  onCreateClick: () => void;
}

export function Filters({
  statusFilter,
  assigneeTypeFilter,
  onStatusChange,
  onAssigneeTypeChange,
  onCreateClick,
}: FiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus | '')}
        className="border border-zinc-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All statuses</option>
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="in_review">In Review</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <select
        value={assigneeTypeFilter}
        onChange={(e) => onAssigneeTypeChange(e.target.value as AssigneeType | '')}
        className="border border-zinc-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All assignees</option>
        <option value="human">Humans</option>
        <option value="agent">Agents</option>
      </select>
      <button
        onClick={onCreateClick}
        className="ml-auto px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        + New Task
      </button>
    </div>
  );
}
