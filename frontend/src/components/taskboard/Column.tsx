"use client";

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '@/types/task';
import { STATUS_LABELS } from '@/types/task';
import { TaskCard } from './TaskCard';

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-zinc-400',
  in_progress: 'bg-blue-500',
  in_review: 'bg-amber-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
};

export function Column({ status, tasks }: { status: TaskStatus; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] w-[280px] rounded-xl transition-colors ${
        isOver ? 'bg-zinc-200/60' : 'bg-zinc-100/80'
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
        <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
          {STATUS_LABELS[status]}
        </h3>
        <span className="ml-auto text-xs text-zinc-400 font-medium">{tasks.length}</span>
      </div>
      <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-xs text-zinc-400 border border-dashed border-zinc-300 rounded-lg">
              No tasks
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}
