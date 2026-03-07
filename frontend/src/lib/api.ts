import type { Task, TaskWithDetails, TaskStatus, AssigneeType } from '@/types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function apiFetch<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface TasksResponse {
  data: Task[];
  pagination: {
    next_cursor: string | null;
    has_more: boolean;
  };
}

export async function fetchTasks(
  token: string,
  workspaceId: string,
  filters?: { status?: TaskStatus; assignee_type?: AssigneeType },
): Promise<TasksResponse> {
  const params = new URLSearchParams({ workspaceId });
  if (filters?.status) params.set('status', filters.status);
  if (filters?.assignee_type) params.set('assignee_type', filters.assignee_type);
  params.set('limit', '100');
  return apiFetch<TasksResponse>(`/tasks?${params}`, token);
}

export async function createTask(
  token: string,
  workspaceId: string,
  data: {
    title: string;
    description?: string;
    assignee_type?: AssigneeType;
    assignee_id?: string;
    autonomy_level?: number;
  },
): Promise<Task> {
  return apiFetch<Task>(`/tasks?workspaceId=${workspaceId}`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTask(
  token: string,
  workspaceId: string,
  taskId: string,
  data: { status?: TaskStatus; title?: string; description?: string; assignee_type?: AssigneeType; assignee_id?: string; autonomy_level?: number },
): Promise<Task> {
  return apiFetch<Task>(`/tasks/${taskId}?workspaceId=${workspaceId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTask(token: string, workspaceId: string, taskId: string): Promise<void> {
  return apiFetch<void>(`/tasks/${taskId}?workspaceId=${workspaceId}`, token, {
    method: 'DELETE',
  });
}

export interface Agent {
  id: string;
  name: string;
  workspaceId: string;
  status: string;
  createdAt: string;
}

export async function fetchAgents(token: string, workspaceId: string): Promise<Agent[]> {
  return apiFetch<Agent[]>(`/agents?workspaceId=${workspaceId}`, token);
}

export async function fetchTask(token: string, workspaceId: string, taskId: string): Promise<TaskWithDetails> {
  return apiFetch<TaskWithDetails>(`/tasks/${taskId}?workspaceId=${workspaceId}`, token);
}

export async function approveTask(token: string, workspaceId: string, taskId: string, comment?: string): Promise<unknown> {
  return apiFetch(`/tasks/${taskId}/approve?workspaceId=${workspaceId}`, token, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}

export async function rejectTask(token: string, workspaceId: string, taskId: string, comment?: string): Promise<unknown> {
  return apiFetch(`/tasks/${taskId}/reject?workspaceId=${workspaceId}`, token, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}

export async function requestChanges(token: string, workspaceId: string, taskId: string, comment?: string): Promise<unknown> {
  return apiFetch(`/tasks/${taskId}/request-changes?workspaceId=${workspaceId}`, token, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}
