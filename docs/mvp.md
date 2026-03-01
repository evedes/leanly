# Leanly — MVP Scope & Architecture

This document defines the MVP boundary, architecture, tech stack, and post-MVP roadmap for Leanly.

---

## MVP Scope

The MVP delivers the **core loop**: **Assign → Observe → Approve**.

1. A human creates a task and assigns it to an AI agent.
2. The agent picks up the task, executes it, and logs every reasoning step as an execution trace.
3. The human reviews the trace, inspects tool calls and token spend, then approves or rejects the output.

Everything in the MVP serves this loop. If a feature doesn't directly support assign, observe, or approve, it's post-MVP.

### What's in

- Workspace creation and human auth (Clerk)
- Taskboard — create, assign, and manage tasks for humans and agents
- Agent registration and API key provisioning
- MCP server — agents connect via Streamable HTTP, fetch tasks, log traces, submit output
- Execution traces — timestamped, collapsible view of every agent step
- Approval queue — single inbox to approve, reject, or request changes
- Autonomy levels — per-task control over agent freedom

### What's out (post-MVP)

- Knowledge base, guardrails, supervision mode, CLI, analytics (see [Roadmap](#roadmap))

---

## Architecture

```
┌──────────────────┐     ┌──────────────────┐
│   Browser (UI)   │     │   Claude Code    │
│   Next.js App    │     │    (via MCP)     │
└────────┬─────────┘     └────────┬─────────┘
         │ REST API               │ MCP (Streamable HTTP)
         │                        │ + API Key Auth
         ▼                        ▼
┌─────────────────────────────────────────────┐
│              Leanly Server                  │
│              (Nest.js API)                  │
│                                             │
│  Taskboard · Agent API · Approvals · Auth   │
└──────────────────────┬──────────────────────┘
                       │ Drizzle ORM
                       ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              └─────────────────┘
```

**Browser clients** connect over REST. **Claude Code** connects through a Model Context Protocol (MCP) server using Streamable HTTP transport, authenticated with API keys. Streamable HTTP enables bidirectional communication — Leanly can push task assignments to Claude Code, and Claude Code can call MCP tools back. One Postgres database holds everything. Clerk handles human auth. The Nest.js backend provides a modular, scalable architecture with built-in support for guards, interceptors, and dependency injection.

---

## MCP Tools

The Leanly MCP server exposes the following tools to connected agents:

| Tool              | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `get_tasks`       | Fetch tasks assigned to the calling agent                          |
| `get_task`        | Fetch a single task by ID with full details                        |
| `log_trace`       | Append a timestamped trace entry (reasoning, tool call, output)    |
| `submit_output`   | Submit the final output for a task and move it to the approval queue |
| `request_input`   | Ask the human for clarification mid-task                           |

All tools are authenticated via the agent's API key, scoped to the agent's workspace.

---

## Tech Stack

| Layer         | Technology                  | Why                                                                 |
| ------------- | --------------------------- | ------------------------------------------------------------------- |
| **Frontend**  | Next.js (App Router)        | Server components, file-based routing, Vercel-native deployment     |
| **Auth**      | Clerk                       | Drop-in auth with org support, free tier sufficient for self-hosted |
| **Backend**   | Nest.js                     | Modular architecture, guards, interceptors, DI out of the box      |
| **ORM**       | Drizzle                     | Type-safe, lightweight, SQL-first — no heavy migration tooling      |
| **Database**  | PostgreSQL                  | Battle-tested, handles the relational model well                    |
| **Protocol**  | MCP (Streamable HTTP)       | Native Claude Code integration, bidirectional communication         |
| **Hosting**   | Docker Compose (self-host) / Vercel + managed Postgres (cloud) | Flexible deployment model |

---

## Self-Hosted vs Cloud

|                        | Self-Hosted        | Cloud Free         | Cloud Pro            |
| ---------------------- | ------------------ | ------------------ | -------------------- |
| **Price**              | $0 (your infra)    | $0                 | $49/mo               |
| **Humans**             | Unlimited          | 1                  | Unlimited            |
| **Agents**             | Unlimited          | 1                  | Unlimited            |
| **Agent tasks**        | Unlimited          | Unlimited          | Unlimited            |
| **Trace retention**    | You decide         | 7 days             | 90 days              |
| **Managed hosting**    | No                 | Yes                | Yes                  |
| **SSO/SAML**          | No                 | No                 | Coming soon          |

No per-seat pricing. No per-agent pricing.

---

## Roadmap

The MVP focuses on the core loop: assign a task to an agent, observe its execution trace, approve or reject the output.

What comes next:

- **Knowledge base** — agents read and write shared docs with version history
- **Guardrails** — token limits, time limits, cost caps, auto-escalation on stuck agents
- **Supervision mode** — real-time streaming of agent work as it happens
- **CLI** — `leanly tasks`, `leanly trace TASK-42`, `leanly approve TASK-42`
- **Analytics dashboard** — agent performance, cost, and throughput metrics
