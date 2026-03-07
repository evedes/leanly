"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import type { Task, TaskStatus, AssigneeType } from '@/types/task';
import { fetchTasks, createTask, updateTask } from '@/lib/api';

interface UseTasksOptions {
  workspaceId: string;
  statusFilter?: TaskStatus;
  assigneeTypeFilter?: AssigneeType;
}

export function useTasks({ workspaceId, statusFilter, assigneeTypeFilter }: UseTasksOptions) {
  const { getToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetchTasks(token, workspaceId, {
        status: statusFilter,
        assignee_type: assigneeTypeFilter,
      });
      setTasks(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, workspaceId, statusFilter, assigneeTypeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const addTask = useCallback(async (data: {
    title: string;
    description?: string;
    assignee_type?: AssigneeType;
    assignee_id?: string;
    autonomy_level?: number;
  }) => {
    const token = await getToken();
    if (!token) return;
    const task = await createTask(token, workspaceId, data);
    setTasks((prev) => [...prev, task]);
    return task;
  }, [getToken, workspaceId]);

  const moveTask = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    const token = await getToken();
    if (!token) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    try {
      await updateTask(token, workspaceId, taskId, { status: newStatus });
    } catch (err: any) {
      // Revert on failure
      await load();
      throw err;
    }
  }, [getToken, workspaceId, load]);

  return { tasks, loading, error, addTask, moveTask, reload: load };
}
