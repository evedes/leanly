<!-- Badges -->
<p align="center">
  <a href="https://github.com/evedes/leanly/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-blue.svg" alt="License: AGPLv3"></a>
  <a href="https://github.com/evedes/leanly/stargazers"><img src="https://img.shields.io/github/stars/evedes/leanly?style=social" alt="GitHub Stars"></a>
  <a href="https://discord.gg/leanly"><img src="https://img.shields.io/discord/000000000000000000?label=Discord&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://github.com/evedes/leanly/actions"><img src="https://img.shields.io/github/actions/workflow/status/evedes/leanly/ci.yml?branch=main&label=CI" alt="CI Status"></a>
</p>

<!-- Logo + Name -->
<h1 align="center">
  <br>
  <img src="docs/assets/logo.svg" alt="Leanly" width="200">
  <br>
  Leanly
  <br>
</h1>

<p align="center"><strong>The open-source control plane for AI agents.</strong></p>

<!-- Hero Screenshot -->
<p align="center">
  <img src="docs/assets/hero-screenshot.png" alt="Leanly — Execution Trace Viewer" width="800">
</p>

---

Your AI agents are working. You have no idea what they're doing.

**Assign. Observe. Approve. Ship.**

Leanly gives you a single workspace where humans lead and agents execute -- with full visibility into every reasoning step, every tool call, every dollar spent. No more Slack threads tracking agent output. No more terminal windows you forgot to check. No more silent failures burning tokens at 3am.

```
              You                        Leanly                       Agent
               |                           |                            |
               |  1. Create task,          |                            |
               |     assign to agent       |                            |
               |  -----------------------> |                            |
               |                           |  2. Agent picks up task    |
               |                           |  ----------------------->  |
               |                           |                            |
               |                           |  3. Agent logs execution   |
               |                           |     trace (every step)     |
               |                           |  <-----------------------  |
               |                           |                            |
               |  4. Review trace,         |  5. Agent submits output   |
               |     see what it did       |  <-----------------------  |
               |  <----------------------- |                            |
               |                           |                            |
               |  6. Approve / Reject      |                            |
               |  -----------------------> |  7. Task complete          |
               |                           |  ----------------------->  |
               |                           |                            |
```

## Key Features

- **Execution Traces** -- See exactly what an agent did, step by step. Every reasoning decision, tool call, and token spent, timestamped and collapsible. The black box is now a glass box.

- **Approval Queue** -- A single inbox for everything your agents need reviewed. Approve, reject, or request changes in one click. Like code review, but for agent work.

- **Autonomy Levels** -- Control how much freedom each agent gets per task. "Approve each step" for sensitive work, "Notify when done" for routine jobs. Trust is earned incrementally.

- **Agent REST API** -- Connect any agent in minutes. Your agents fetch tasks, log traces, submit output, and request approval through a simple REST API. Framework-agnostic -- works with CrewAI, LangGraph, AutoGen, Claude Code, Cursor, or your own custom agents.

- **Taskboard** -- One board for humans and agents. Assign tasks to either from the same picker. Agents get distinct avatars so you always know who (or what) is working on what.

## Quick Start

### Cloud (fastest)

1. Sign up at [leanly.ink](https://leanly.ink)
2. Create a workspace and register your first agent
3. Connect your agent using the SDK:

```typescript
import { LeanlyAgent } from "@leanly/sdk";

const agent = new LeanlyAgent({
  apiKey: process.env.LEANLY_API_KEY,
  agentId: "your-agent-id",
});

// Fetch assigned tasks, do work, report back
const tasks = await agent.getTasks();
```

### Self-Hosted

**Prerequisites:** Docker 24+, a [Clerk](https://clerk.com) account (free tier works)

```bash
git clone https://github.com/evedes/leanly.git
cd leanly
cp .env.example .env    # Add your Clerk keys
docker compose up -d
```

Open `http://localhost:3000` and create your workspace.

Then connect an agent:

```typescript
import { LeanlyAgent } from "@leanly/sdk";

const agent = new LeanlyAgent({
  apiKey: process.env.LEANLY_API_KEY,
  agentId: "your-agent-id",
  baseUrl: "http://localhost:3000/api",  // Your self-hosted instance
});

const tasks = await agent.getTasks();

for (const task of tasks) {
  await agent.logTrace(task.id, {
    type: "reasoning",
    content: "Analyzing the requirements...",
  });

  // ... do the work ...

  await agent.submitOutput(task.id, {
    content: "Here are the results.",
  });
}
```

## Architecture

```
┌──────────────────┐     ┌──────────────────┐
│   Browser (UI)   │     │   Your Agents    │
│   Next.js App    │     │  (any framework) │
└────────┬─────────┘     └────────┬─────────┘
         │ tRPC                   │ REST API
         │                        │ + API Key Auth
         ▼                        ▼
┌─────────────────────────────────────────────┐
│              Leanly Server                  │
│           (Next.js API Routes)              │
│                                             │
│  Taskboard · Agent API · Approvals · Auth   │
└──────────────────────┬──────────────────────┘
                       │ Drizzle ORM
                       ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              └─────────────────┘
```

**Browser clients** connect over tRPC (type-safe, full-stack). **Agents** connect over REST with API key authentication. One Postgres database holds everything. Clerk handles human auth. Real-time updates (activity feed, trace streaming) use Server-Sent Events.

## Self-Hosted vs Cloud

|                        | Self-Hosted        | Cloud Free         | Cloud Pro            |
| ---------------------- | ------------------ | ------------------ | -------------------- |
| **Price**              | $0 (your infra)    | $0                 | $49/mo               |
| **Humans**             | Unlimited          | 1                  | Unlimited            |
| **Agents**             | Unlimited          | 2                  | Unlimited            |
| **Agent tasks**        | Unlimited          | 50/mo              | Unlimited            |
| **Trace retention**    | You decide         | 7 days             | 90 days              |
| **Managed hosting**    | No                 | Yes                | Yes                  |
| **SSO/SAML**          | No                 | No                 | Coming soon          |

No per-seat pricing. No per-agent pricing.

## Works With

Leanly is the coordination layer, not the AI provider. Bring your own agents:

- [CrewAI](https://www.crewai.com/)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [AutoGen](https://microsoft.github.io/autogen/)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [Cursor](https://cursor.com/)
- Any agent that can make HTTP requests

MCP (Model Context Protocol) support is on the roadmap. The REST API is the primary integration path today.

## Roadmap

The MVP focuses on the core loop: assign a task to an agent, observe its execution trace, approve or reject the output.

What comes next:

- **Knowledge base** -- agents read and write shared docs with version history
- **Guardrails** -- token limits, time limits, cost caps, auto-escalation on stuck agents
- **Supervision mode** -- real-time streaming of agent work as it happens
- **MCP protocol support** -- native Model Context Protocol integration
- **CLI** -- `leanly tasks`, `leanly trace TASK-42`, `leanly approve TASK-42`
- **Analytics dashboard** -- agent performance, cost, and throughput metrics

See [`docs/product-spec.md`](docs/product-spec.md) for the full roadmap.

## Contributing

Contributions are welcome. We are setting up the contributing guide -- check back soon or open an issue to discuss your idea.

See [CONTRIBUTING.md](CONTRIBUTING.md) (coming soon).

## Community

- [Discord](https://discord.gg/leanly) -- questions, feedback, show what you built
- [Twitter / X](https://x.com/leanlyink) -- updates and announcements
- [GitHub Discussions](https://github.com/evedes/leanly/discussions) -- feature requests, architecture decisions

## License

Leanly is open source under the [GNU AGPLv3 License](LICENSE). The Agent SDKs (`@leanly/sdk`) are MIT licensed.
