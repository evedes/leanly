"use client";

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import type { TaskStatus, AssigneeType } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';
import { Board } from '@/components/taskboard/Board';
import { Filters } from '@/components/taskboard/Filters';
import { CreateTaskModal } from '@/components/taskboard/CreateTaskModal';

// TODO: Replace with dynamic workspace selection
const WORKSPACE_ID = process.env.NEXT_PUBLIC_WORKSPACE_ID ?? '';

export default function TaskboardPage() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [assigneeTypeFilter, setAssigneeTypeFilter] = useState<AssigneeType | ''>('');
  const [modalOpen, setModalOpen] = useState(false);

  const { tasks, loading, error, addTask, moveTask } = useTasks({
    workspaceId: WORKSPACE_ID,
    statusFilter: statusFilter || undefined,
    assigneeTypeFilter: assigneeTypeFilter || undefined,
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Taskboard</h1>
        <UserButton />
      </header>
      <main className="p-6 space-y-4">
        <Filters
          statusFilter={statusFilter}
          assigneeTypeFilter={assigneeTypeFilter}
          onStatusChange={setStatusFilter}
          onAssigneeTypeChange={setAssigneeTypeFilter}
          onCreateClick={() => setModalOpen(true)}
        />
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-sm text-zinc-400">
            Loading tasks...
          </div>
        ) : (
          <Board tasks={tasks} onMoveTask={moveTask} />
        )}
      </main>
      <CreateTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addTask}
      />
    </div>
  );
}
