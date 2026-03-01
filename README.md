<!-- Badges -->
<p align="center">
  <a href="https://github.com/evedes/leanly/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-blue.svg" alt="License: AGPLv3"></a>
  <a href="https://github.com/evedes/leanly/stargazers"><img src="https://img.shields.io/github/stars/evedes/leanly?style=social" alt="GitHub Stars"></a>
  <a href="https://discord.gg/leanly"><img src="https://img.shields.io/discord/000000000000000000?label=Discord&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://github.com/evedes/leanly/actions"><img src="https://img.shields.io/github/actions/workflow/status/evedes/leanly/ci.yml?branch=main&label=CI" alt="CI Status"></a>
</p>

<!-- Name -->
<h1 align="center">Leanly</h1>

<p align="center"><strong>The open-source control plane for AI agents.</strong></p>

---

Your AI agents are working. You have no idea what they're doing.

**Assign. Observe. Approve. Ship.**

Leanly gives you a single workspace where humans lead and agents execute -- with full visibility into every reasoning step, every tool call, every dollar spent. No more Slack threads tracking agent output. No more terminal windows you forgot to check. No more silent failures burning tokens at 3am.

```
              You                     Leanly MCP                  Claude Code
               |                           |                            |
               |  1. Create task,          |                            |
               |     assign to agent       |                            |
               |  -----------------------> |                            |
               |                           |  2. Task notification      |
               |                           |     (server-initiated)     |
               |                           |  ----------------------->  |
               |                           |                            |
               |                           |  3. log_trace (MCP tool)   |
               |                           |     (every step)           |
               |                           |  <-----------------------  |
               |                           |                            |
               |  4. Review trace,         |  5. submit_output          |
               |     see what it did       |     (MCP tool)             |
               |  <----------------------- |  <-----------------------  |
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

- **MCP Integration** -- Claude Code connects to Leanly through a Model Context Protocol server. Agents fetch tasks, log traces, submit output, and request approval natively -- no SDK or HTTP glue code needed.

- **Taskboard** -- One board for humans and agents. Assign tasks to either from the same picker. Agents get distinct avatars so you always know who (or what) is working on what.

## Quick Start

### Cloud (fastest)

1. Sign up at [leanly.ink](https://leanly.ink)
2. Create a workspace and register your first agent
3. Add the Leanly MCP server to your Claude Code config:

```json
{
  "mcpServers": {
    "leanly": {
      "url": "https://mcp.leanly.ink/mcp",
      "env": {
        "LEANLY_API_KEY": "your-api-key"
      }
    }
  }
}
```

4. Claude Code can now fetch tasks, log traces, and submit output directly.

### Self-Hosted

**Prerequisites:** Docker 24+, a [Clerk](https://clerk.com) account (free tier works)

```bash
git clone https://github.com/evedes/leanly.git
cd leanly
cp .env.example .env    # Add your Clerk keys
docker compose up -d
```

Open `http://localhost:3000` and create your workspace.

Then connect Claude Code to your self-hosted instance:

```json
{
  "mcpServers": {
    "leanly": {
      "url": "http://localhost:3000/mcp",
      "env": {
        "LEANLY_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Works With

Leanly integrates with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) through the Model Context Protocol (MCP). Claude Code connects to the Leanly MCP server to fetch tasks, log execution traces, submit output, and request approval -- all natively from the terminal.

## Roadmap

See [`docs/mvp.md`](docs/mvp.md) for the full MVP scope, architecture, and roadmap.

## Contributing

Contributions are welcome. We are setting up the contributing guide -- check back soon or open an issue to discuss your idea.

See [CONTRIBUTING.md](CONTRIBUTING.md) (coming soon).

## Community

- [Discord](https://discord.gg/leanly) -- questions, feedback, show what you built
- [Twitter / X](https://x.com/leanlyink) -- updates and announcements
- [GitHub Discussions](https://github.com/evedes/leanly/discussions) -- feature requests, architecture decisions

## License

Leanly is open source under the [GNU AGPLv3 License](LICENSE).
