import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { TasksService } from '../tasks/index.js';
import { TracesService } from '../traces/index.js';

interface AgentContext {
  agentId: string;
  workspaceId: string;
  apiKeyId: string;
}

@Injectable()
export class McpService implements OnModuleDestroy {
  private transports = new Map<string, StreamableHTTPServerTransport>();

  constructor(
    private readonly tasksService: TasksService,
    private readonly tracesService: TracesService,
  ) {}

  async onModuleDestroy() {
    for (const transport of this.transports.values()) {
      await transport.close();
    }
    this.transports.clear();
  }

  private createServer(agent: AgentContext): McpServer {
    const server = new McpServer(
      { name: 'leanly', version: '0.1.0' },
      { capabilities: { tools: {} } },
    );

    this.registerTools(server, agent);
    return server;
  }

  private registerTools(server: McpServer, agent: AgentContext) {
    const { agentId, workspaceId } = agent;

    // LEA-12: get_tasks — Fetch tasks assigned to the calling agent
    server.tool(
      'get_tasks',
      'Fetch all tasks assigned to this agent. Supports optional status filter.',
      {
        status: z.enum(['todo', 'in_progress', 'in_review', 'approved', 'rejected']).optional(),
      },
      async (args) => {
        const tasks = await this.tasksService.findByAssignee(workspaceId, agentId, {
          status: args.status,
        });
        return { content: [{ type: 'text', text: JSON.stringify(tasks) }] };
      },
    );

    // LEA-12: get_task — Fetch a single task with full details, traces, and reviewer comments
    server.tool(
      'get_task',
      'Get a task by ID with full details including traces and reviewer comments.',
      { task_id: z.string().uuid() },
      async (args) => {
        const task = await this.tasksService.findOneWithDetails(args.task_id, workspaceId);
        return { content: [{ type: 'text', text: JSON.stringify(task) }] };
      },
    );

    // LEA-13: log_trace — Append a trace entry to a task
    server.tool(
      'log_trace',
      'Log an execution trace entry for a task. Task must be assigned to this agent and in "in_progress" status.',
      {
        task_id: z.string().uuid(),
        type: z.enum(['reasoning', 'tool_call', 'output', 'error']),
        content: z.record(z.string(), z.unknown()),
        token_count: z.number().int().optional(),
      },
      async (args) => {
        const task = await this.tasksService.findOne(args.task_id, workspaceId);

        if (task.assigneeType !== 'agent' || task.assigneeId !== agentId) {
          throw new Error('Task is not assigned to this agent');
        }
        if (task.status !== 'in_progress') {
          throw new Error('Task must be in "in_progress" status to log traces');
        }

        const trace = await this.tracesService.create(
          args.task_id,
          agentId,
          workspaceId,
          { type: args.type, content: args.content as Record<string, unknown>, token_count: args.token_count },
        );
        return { content: [{ type: 'text', text: JSON.stringify(trace) }] };
      },
    );

    // LEA-13: submit_output — Submit final output and move task to in_review
    server.tool(
      'submit_output',
      'Submit the final output for a task. Moves the task from "in_progress" to "in_review" and creates an output trace entry.',
      {
        task_id: z.string().uuid(),
        output: z.union([z.string(), z.record(z.string(), z.unknown())]),
      },
      async (args) => {
        const task = await this.tasksService.findOne(args.task_id, workspaceId);

        if (task.assigneeType !== 'agent' || task.assigneeId !== agentId) {
          throw new Error('Task is not assigned to this agent');
        }
        if (task.status !== 'in_progress') {
          throw new Error('Task must be in "in_progress" status to submit output');
        }

        const outputContent = typeof args.output === 'string'
          ? { output: args.output }
          : args.output as Record<string, unknown>;

        // Create the output trace
        await this.tracesService.create(
          args.task_id,
          agentId,
          workspaceId,
          { type: 'output', content: outputContent },
        );

        // Transition task to in_review
        const updated = await this.tasksService.update(args.task_id, workspaceId, {
          status: 'in_review',
        });

        return { content: [{ type: 'text', text: JSON.stringify(updated) }] };
      },
    );

    // LEA-14: request_input — Ask the human for clarification
    server.tool(
      'request_input',
      'Ask the human for clarification on a task. Creates a trace entry with the question. The agent can poll for responses via get_task.',
      {
        task_id: z.string().uuid(),
        question: z.string().min(1).max(5000),
      },
      async (args) => {
        const task = await this.tasksService.findOne(args.task_id, workspaceId);

        if (task.assigneeType !== 'agent' || task.assigneeId !== agentId) {
          throw new Error('Task is not assigned to this agent');
        }
        if (task.status !== 'in_progress') {
          throw new Error('Task must be in "in_progress" status to request input');
        }

        const trace = await this.tracesService.create(
          args.task_id,
          agentId,
          workspaceId,
          { type: 'reasoning', content: { input_request: true, question: args.question } },
        );

        return { content: [{ type: 'text', text: JSON.stringify({ input_request_id: trace.id, question: args.question }) }] };
      },
    );
  }

  async handleRequest(req: any, res: any, agent: AgentContext) {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    // Existing session
    if (sessionId && this.transports.has(sessionId)) {
      const transport = this.transports.get(sessionId)!;
      await transport.handleRequest(req, res, req.body);
      return;
    }

    // GET/DELETE require an existing session
    if (req.method === 'GET' || req.method === 'DELETE') {
      res.status(400).json({ error: 'Invalid or missing session ID' });
      return;
    }

    // New session (POST with initialize request)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => {
        this.transports.set(id, transport);
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        this.transports.delete(transport.sessionId);
      }
    };

    const server = this.createServer(agent);
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }
}
