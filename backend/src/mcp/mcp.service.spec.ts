import { McpService } from './mcp.service.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import http from 'node:http';

describe('McpService', () => {
  let mcpService: McpService;
  let server: http.Server;
  let baseUrl: string;

  const mockAgent = {
    agentId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    workspaceId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    apiKeyId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  };

  const mockTask = {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    title: 'Test Task',
    status: 'in_progress',
    assigneeType: 'agent',
    assigneeId: mockAgent.agentId,
    workspaceId: mockAgent.workspaceId,
  };

  const mockTasksService = {
    findAll: jest.fn().mockResolvedValue({ data: [], pagination: { next_cursor: null, has_more: false } }),
    findByAssignee: jest.fn().mockResolvedValue([mockTask]),
    findOne: jest.fn().mockResolvedValue(mockTask),
    findOneWithTraces: jest.fn().mockResolvedValue({ ...mockTask, traces: [] }),
    findOneWithDetails: jest.fn().mockResolvedValue({ ...mockTask, traces: [], approvals: [] }),
    update: jest.fn().mockResolvedValue({ ...mockTask, status: 'in_review' }),
  };

  const mockTracesService = {
    create: jest.fn().mockResolvedValue({ id: 'trace-1', type: 'reasoning', content: {} }),
  };

  beforeAll(async () => {
    mcpService = new McpService(
      mockTasksService as any,
      mockTracesService as any,
    );

    server = http.createServer(async (req, res) => {
      if (req.method === 'POST') {
        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', async () => {
          const body = JSON.parse(Buffer.concat(chunks).toString());
          (req as any).body = body;
          (res as any).status = (code: number) => {
            res.statusCode = code;
            return {
              json: (data: any) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              },
            };
          };
          await mcpService.handleRequest(req, res, mockAgent);
        });
      } else {
        (res as any).status = (code: number) => {
          res.statusCode = code;
          return {
            json: (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            },
          };
        };
        await mcpService.handleRequest(req, res, mockAgent);
      }
    });

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await mcpService.onModuleDestroy();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockTasksService.findAll.mockResolvedValue({ data: [], pagination: { next_cursor: null, has_more: false } });
    mockTasksService.findByAssignee.mockResolvedValue([mockTask]);
    mockTasksService.findOne.mockResolvedValue(mockTask);
    mockTasksService.findOneWithTraces.mockResolvedValue({ ...mockTask, traces: [] });
    mockTasksService.findOneWithDetails.mockResolvedValue({ ...mockTask, traces: [], approvals: [] });
    mockTasksService.update.mockResolvedValue({ ...mockTask, status: 'in_review' });
    mockTracesService.create.mockResolvedValue({ id: 'trace-1', type: 'reasoning', content: {} });
  });

  it('should advertise all expected tools', async () => {
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
    await client.connect(transport);

    const result = await client.listTools();
    const toolNames = result.tools.map((t) => t.name);

    expect(toolNames).toContain('get_tasks');
    expect(toolNames).toContain('get_task');
    expect(toolNames).toContain('log_trace');
    expect(toolNames).toContain('submit_output');
    expect(toolNames).toContain('request_input');
    expect(toolNames).toHaveLength(5);

    await client.close();
  });

  it('get_tasks should filter by calling agent', async () => {
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
    await client.connect(transport);

    const result = await client.callTool({ name: 'get_tasks', arguments: {} });
    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe('Test Task');
    expect(mockTasksService.findByAssignee).toHaveBeenCalledWith(
      mockAgent.workspaceId,
      mockAgent.agentId,
      {},
    );

    await client.close();
  });

  it('get_task should return task with details and approvals', async () => {
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
    await client.connect(transport);

    const result = await client.callTool({
      name: 'get_task',
      arguments: { task_id: mockTask.id },
    });
    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);

    expect(parsed.traces).toEqual([]);
    expect(parsed.approvals).toEqual([]);
    expect(mockTasksService.findOneWithDetails).toHaveBeenCalledWith(
      mockTask.id,
      mockAgent.workspaceId,
    );

    await client.close();
  });

  it('submit_output should create trace and transition task', async () => {
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
    await client.connect(transport);

    const result = await client.callTool({
      name: 'submit_output',
      arguments: { task_id: mockTask.id, output: 'Final result' },
    });
    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);

    expect(parsed.status).toBe('in_review');
    expect(mockTracesService.create).toHaveBeenCalledWith(
      mockTask.id,
      mockAgent.agentId,
      mockAgent.workspaceId,
      { type: 'output', content: { output: 'Final result' } },
    );
    expect(mockTasksService.update).toHaveBeenCalledWith(
      mockTask.id,
      mockAgent.workspaceId,
      { status: 'in_review' },
    );

    await client.close();
  });

  it('request_input should create a trace with the question', async () => {
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
    await client.connect(transport);

    const result = await client.callTool({
      name: 'request_input',
      arguments: { task_id: mockTask.id, question: 'What format should the report use?' },
    });
    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);

    expect(parsed.input_request_id).toBe('trace-1');
    expect(parsed.question).toBe('What format should the report use?');
    expect(mockTracesService.create).toHaveBeenCalledWith(
      mockTask.id,
      mockAgent.agentId,
      mockAgent.workspaceId,
      { type: 'reasoning', content: { input_request: true, question: 'What format should the report use?' } },
    );

    await client.close();
  });
});
