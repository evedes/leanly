"use client";

import { useState } from 'react';
import type { Trace } from '@/types/task';

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  reasoning: { label: 'Reasoning', icon: '💭', color: 'border-blue-200 bg-blue-50' },
  tool_call: { label: 'Tool Call', icon: '🔧', color: 'border-amber-200 bg-amber-50' },
  output: { label: 'Output', icon: '📤', color: 'border-emerald-200 bg-emerald-50' },
  error: { label: 'Error', icon: '❌', color: 'border-red-200 bg-red-50' },
};

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function JsonBlock({ data }: { data: unknown }) {
  const json = JSON.stringify(data, null, 2);
  return (
    <pre className="text-xs bg-zinc-900 text-zinc-100 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words">
      {json}
    </pre>
  );
}

export function TraceEntry({ trace }: { trace: Trace }) {
  const [expanded, setExpanded] = useState(false);
  const config = TYPE_CONFIG[trace.type] ?? TYPE_CONFIG.reasoning;

  const isInputRequest = trace.type === 'reasoning' && (trace.content as any)?.input_request;
  const isInputResponse = trace.type === 'reasoning' && (trace.content as any)?.input_response;

  const renderContent = () => {
    if (isInputRequest) {
      return (
        <div className="text-sm text-blue-800 bg-blue-100 border border-blue-200 rounded-lg p-3">
          <span className="font-medium">Agent question:</span> {(trace.content as any).question}
        </div>
      );
    }

    if (isInputResponse) {
      return (
        <div className="text-sm text-green-800 bg-green-100 border border-green-200 rounded-lg p-3">
          <span className="font-medium">Human response:</span> {(trace.content as any).response}
        </div>
      );
    }

    if (trace.type === 'output') {
      const output = (trace.content as any).output;
      if (typeof output === 'string') {
        return <div className="text-sm text-zinc-800 whitespace-pre-wrap">{output}</div>;
      }
      return <JsonBlock data={trace.content} />;
    }

    if (trace.type === 'error') {
      return (
        <div className="text-sm text-red-700 whitespace-pre-wrap">
          {(trace.content as any).message || JSON.stringify(trace.content, null, 2)}
        </div>
      );
    }

    return <JsonBlock data={trace.content} />;
  };

  return (
    <div className={`border rounded-lg ${config.color}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
      >
        <span className="text-sm">{config.icon}</span>
        <span className="text-xs font-semibold text-zinc-700">{config.label}</span>
        {isInputRequest && <span className="text-[10px] font-medium text-blue-600 bg-blue-200 px-1.5 py-0.5 rounded-full">Input Request</span>}
        {isInputResponse && <span className="text-[10px] font-medium text-green-600 bg-green-200 px-1.5 py-0.5 rounded-full">Response</span>}
        <span className="ml-auto text-[10px] text-zinc-500">{formatTimestamp(trace.timestamp)}</span>
        {trace.tokenCount != null && (
          <span className="text-[10px] text-zinc-400">{trace.tokenCount} tokens</span>
        )}
        <span className="text-zinc-400 text-xs">{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && <div className="px-3 pb-3">{renderContent()}</div>}
    </div>
  );
}
