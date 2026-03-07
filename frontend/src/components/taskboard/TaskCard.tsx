"use client";

import { useRouter } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types/task';
import { AUTONOMY_LABELS } from '@/types/task';

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function TaskCard({ task }: { task: Task }) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-zinc-200 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-zinc-300 transition-colors"
    >
      <p
        className="text-sm font-medium text-zinc-900 leading-snug hover:text-blue-600 cursor-pointer"
        onClick={() => router.push(`/taskboard/${task.id}`)}
      >
        {task.title}
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
        {task.assigneeType && (
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
            task.assigneeType === 'agent'
              ? 'bg-violet-100 text-violet-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {task.assigneeType === 'agent' ? 'Agent' : 'Human'}
          </span>
        )}
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-medium">
          {AUTONOMY_LABELS[task.autonomyLevel] ?? `Level ${task.autonomyLevel}`}
        </span>
        <span className="ml-auto">{timeAgo(task.createdAt)}</span>
      </div>
    </div>
  );
}
