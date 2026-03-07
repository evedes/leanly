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

    server.tool(
      'list_tasks',
      'List tasks in the workspace. Filterable by status and assignee type.',
      {
        status: z.enum(['todo', 'in_progress', 'in_review', 'approved', 'rejected']).optional(),
        assignee_type: z.enum(['human', 'agent']).optional(),
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      },
      async (args) => {
        const result = await this.tasksService.findAll(workspaceId, args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'get_task',
      'Get a task by ID, including its execution traces.',
      { task_id: z.string().uuid() },
      async (args) => {
        const task = await this.tasksService.findOneWithTraces(args.task_id, workspaceId);
        return { content: [{ type: 'text', text: JSON.stringify(task) }] };
      },
    );

    server.tool(
      'update_task',
      'Update a task (status, title, description, assignee, autonomy level).',
      {
        task_id: z.string().uuid(),
        title: z.string().min(1).max(500).optional(),
        description: z.string().optional(),
        status: z.enum(['todo', 'in_progress', 'in_review', 'approved', 'rejected']).optional(),
        assignee_type: z.enum(['human', 'agent']).optional(),
        assignee_id: z.string().uuid().optional(),
        autonomy_level: z.number().int().min(0).max(2).optional(),
      },
      async (args) => {
        const { task_id, ...data } = args;
        const task = await this.tasksService.update(task_id, workspaceId, data);
        return { content: [{ type: 'text', text: JSON.stringify(task) }] };
      },
    );

    server.tool(
      'create_trace',
      'Log an execution trace entry for a task.',
      {
        task_id: z.string().uuid(),
        type: z.enum(['reasoning', 'tool_call', 'output', 'error']),
        content: z.record(z.string(), z.unknown()),
        token_count: z.number().int().optional(),
      },
      async (args) => {
        const trace = await this.tracesService.create(
          args.task_id,
          agentId,
          workspaceId,
          { type: args.type, content: args.content as Record<string, unknown>, token_count: args.token_count },
        );
        return { content: [{ type: 'text', text: JSON.stringify(trace) }] };
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
