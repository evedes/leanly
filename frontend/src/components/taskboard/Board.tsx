"use client";

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { Task, TaskStatus } from '@/types/task';
import { STATUS_ORDER } from '@/types/task';
import { Column } from './Column';
import { TaskCard } from './TaskCard';

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress'],
  in_progress: ['in_review'],
  in_review: ['approved', 'rejected'],
  approved: [],
  rejected: [],
};

interface BoardProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

export function Board({ tasks, onMoveTask }: BoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const tasksByStatus = STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = (event.active.data.current as any)?.task as Task | undefined;
    setActiveTask(task ?? null);
    setMoveError(null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const task = (active.data.current as any)?.task as Task | undefined;
      if (!task) return;

      const targetStatus = over.id as TaskStatus;
      if (task.status === targetStatus) return;

      const allowed = VALID_TRANSITIONS[task.status];
      if (!allowed.includes(targetStatus)) {
        setMoveError(`Cannot move from "${task.status}" to "${targetStatus}"`);
        setTimeout(() => setMoveError(null), 3000);
        return;
      }

      try {
        await onMoveTask(task.id, targetStatus);
      } catch (err: any) {
        setMoveError(err.message);
        setTimeout(() => setMoveError(null), 3000);
      }
    },
    [onMoveTask],
  );

  return (
    <div className="relative">
      {moveError && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg shadow-sm">
          {moveError}
        </div>
      )}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => (
            <Column key={status} status={status} tasks={tasksByStatus[status]} />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="w-[260px]">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
