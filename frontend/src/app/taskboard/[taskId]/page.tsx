"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, UserButton } from '@clerk/nextjs';
import type { TaskWithDetails } from '@/types/task';
import { STATUS_LABELS, AUTONOMY_LABELS } from '@/types/task';
import { fetchTask, approveTask, rejectTask, requestChanges } from '@/lib/api';
import { TraceEntry } from '@/components/task-detail/TraceEntry';
import { ApprovalActions } from '@/components/task-detail/ApprovalActions';

const WORKSPACE_ID = process.env.NEXT_PUBLIC_WORKSPACE_ID ?? '';

const STATUS_BADGE_COLORS: Record<string, string> = {
  todo: 'bg-zinc-100 text-zinc-700',
  in_progress: 'bg-blue-100 text-blue-700',
  in_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await fetchTask(token, WORKSPACE_ID, taskId);
      setTask(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, taskId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = useCallback(async (comment?: string) => {
    const token = await getToken();
    if (!token) return;
    await approveTask(token, WORKSPACE_ID, taskId, comment);
    await load();
  }, [getToken, taskId, load]);

  const handleReject = useCallback(async (comment?: string) => {
    const token = await getToken();
    if (!token) return;
    await rejectTask(token, WORKSPACE_ID, taskId, comment);
    await load();
  }, [getToken, taskId, load]);

  const handleRequestChanges = useCallback(async (comment?: string) => {
    const token = await getToken();
    if (!token) return;
    await requestChanges(token, WORKSPACE_ID, taskId, comment);
    await load();
  }, [getToken, taskId, load]);

  const totalTokens = task?.traces.reduce((sum, t) => sum + (t.tokenCount ?? 0), 0) ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-sm text-zinc-400">
        Loading...
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm text-red-600">{error ?? 'Task not found'}</p>
          <button onClick={() => router.push('/taskboard')} className="text-sm text-blue-600 hover:underline">
            Back to taskboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/taskboard')}
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-zinc-900">Task Detail</h1>
        </div>
        <UserButton />
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Task header */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-zinc-900">{task.title}</h2>
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_COLORS[task.status]}`}>
              {STATUS_LABELS[task.status]}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            {task.assigneeType && (
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                task.assigneeType === 'agent'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {task.assigneeType === 'agent' ? 'Agent' : 'Human'}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
              {AUTONOMY_LABELS[task.autonomyLevel] ?? `Level ${task.autonomyLevel}`}
            </span>
            {totalTokens > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                {totalTokens.toLocaleString()} tokens
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-sm text-zinc-700 whitespace-pre-wrap pt-1">{task.description}</p>
          )}
        </div>

        {/* Approval actions */}
        {task.status === 'in_review' && (
          <ApprovalActions
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestChanges={handleRequestChanges}
          />
        )}

        {/* Approval history */}
        {task.approvals && task.approvals.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-700">Review History</h3>
            {task.approvals.map((a) => (
              <div key={a.id} className={`border rounded-lg p-3 text-sm ${
                a.decision === 'approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
                a.decision === 'rejected' ? 'border-red-200 bg-red-50 text-red-800' :
                'border-amber-200 bg-amber-50 text-amber-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{a.decision.replace('_', ' ')}</span>
                  <span className="text-xs opacity-70">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
                {a.comment && <p className="mt-1 text-sm">{a.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Execution traces */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-700">
            Execution Traces ({task.traces.length})
          </h3>
          {task.traces.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-xs text-zinc-400 border border-dashed border-zinc-300 rounded-lg">
              No traces yet
            </div>
          ) : (
            <div className="space-y-2">
              {task.traces.map((trace) => (
                <TraceEntry key={trace.id} trace={trace} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
