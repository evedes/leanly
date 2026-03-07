import { McpService } from './mcp.service.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import http from 'node:http';

describe('McpService', () => {
  let mcpService: McpService;
  let server: http.Server;
  let baseUrl: string;

  const mockAgent = {
    agentId: '00000000-0000-0000-0000-000000000001',
    workspaceId: '00000000-0000-0000-0000-000000000002',
    apiKeyId: '00000000-0000-0000-0000-000000000003',
  };

  const mockTasksService = {
    findAll: jest.fn().mockResolvedValue({ data: [], pagination: { next_cursor: null, has_more: false } }),
    findOne: jest.fn().mockResolvedValue({ id: 'task-1', title: 'Test', status: 'todo' }),
    findOneWithTraces: jest.fn().mockResolvedValue({ id: 'task-1', title: 'Test', status: 'todo', traces: [] }),
    update: jest.fn().mockResolvedValue({ id: 'task-1', title: 'Updated', status: 'in_progress' }),
  };

  const mockTracesService = {
    create: jest.fn().mockResolvedValue({ id: 'trace-1', type: 'reasoning', content: {} }),
  };

  beforeAll(async () => {
    mcpService = new McpService(
      mockTasksService as any,
      mockTracesService as any,
    );

    // Create a simple HTTP server that delegates to the MCP service
    server = http.createServer(async (req, res) => {
      // Collect body for POST requests
      if (req.method === 'POST') {
        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', async () => {
          const body = JSON.parse(Buffer.concat(chunks).toString());
          (req as any).body = body;

          // Wrap res to add json method
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

  it('should connect via Streamable HTTP and list tools', async () => {
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));

    await client.connect(transport);

    const result = await client.listTools();
    const toolNames = result.tools.map((t) => t.name);

    expect(toolNames).toContain('list_tasks');
    expect(toolNames).toContain('get_task');
    expect(toolNames).toContain('update_task');
    expect(toolNames).toContain('create_trace');

    await client.close();
  });

  it('should call list_tasks tool', async () => {
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));

    await client.connect(transport);

    const result = await client.callTool({ name: 'list_tasks', arguments: {} });
    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0].text);

    expect(parsed.data).toEqual([]);
    expect(parsed.pagination.has_more).toBe(false);
    expect(mockTasksService.findAll).toHaveBeenCalledWith(mockAgent.workspaceId, {});

    await client.close();
  });
});
