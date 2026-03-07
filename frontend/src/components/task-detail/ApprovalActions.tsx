"use client";

import { useState } from 'react';

interface ApprovalActionsProps {
  onApprove: (comment?: string) => Promise<void>;
  onReject: (comment?: string) => Promise<void>;
  onRequestChanges: (comment?: string) => Promise<void>;
}

export function ApprovalActions({ onApprove, onReject, onRequestChanges }: ApprovalActionsProps) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async (action: (comment?: string) => Promise<void>) => {
    setSubmitting(true);
    setError(null);
    try {
      await action(comment || undefined);
      setComment('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-amber-800">Review Required</h3>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment (required for reject/request changes)..."
        rows={3}
        className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-white"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => handle(onApprove)}
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => handle(onReject)}
          disabled={submitting || !comment.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          Reject
        </button>
        <button
          onClick={() => handle(onRequestChanges)}
          disabled={submitting || !comment.trim()}
          className="px-4 py-2 text-sm font-medium text-amber-800 bg-amber-200 rounded-lg hover:bg-amber-300 disabled:opacity-50"
        >
          Request Changes
        </button>
      </div>
    </div>
  );
}
