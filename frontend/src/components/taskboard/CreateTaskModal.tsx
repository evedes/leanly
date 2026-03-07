"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import type { AssigneeType } from '@/types/task';
import { fetchAgents, type Agent } from '@/lib/api';

const WORKSPACE_ID = process.env.NEXT_PUBLIC_WORKSPACE_ID ?? '';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    assignee_type?: AssigneeType;
    assignee_id?: string;
    autonomy_level?: number;
  }) => Promise<unknown>;
}

export function CreateTaskModal({ open, onClose, onSubmit }: CreateTaskModalProps) {
  const { getToken } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeType, setAssigneeType] = useState<AssigneeType | ''>('');
  const [assigneeId, setAssigneeId] = useState('');
  const [autonomyLevel, setAutonomyLevel] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await fetchAgents(token, WORKSPACE_ID);
        setAgents(data.filter((a) => a.status === 'active'));
      } catch {
        // silently fail — agents dropdown will be empty
      }
    })();
  }, [open, getToken]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title,
        description: description || undefined,
        assignee_type: assigneeType || undefined,
        assignee_id: assigneeId || undefined,
        autonomy_level: autonomyLevel,
      });
      setTitle('');
      setDescription('');
      setAssigneeType('');
      setAssigneeId('');
      setAutonomyLevel(0);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Create Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={500}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Task title"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Assign to</label>
              <select
                value={assigneeType ? `${assigneeType}:${assigneeId}` : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setAssigneeType('');
                    setAssigneeId('');
                  } else {
                    const [type, id] = val.split(':');
                    setAssigneeType(type as AssigneeType);
                    setAssigneeId(id);
                  }
                }}
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Unassigned</option>
                <option value="human:">Myself (Human)</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={`agent:${agent.id}`}>
                    {agent.name} (Agent)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Autonomy Level</label>
              <select
                value={autonomyLevel}
                onChange={(e) => setAutonomyLevel(Number(e.target.value))}
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Step by step</option>
                <option value={1}>Checkpoint</option>
                <option value={2}>Autonomous</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
