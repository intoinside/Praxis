import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ErrorCode,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { taskManager } from './task-manager.js';
import { DriftDetectionTask } from './tasks/drift-detection.js';
import { DocumentationUpdateTask } from './tasks/documentation-update.js';

export class PraxisMcpServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: 'praxis-agent',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupTools();

        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
    }

    private setupTools() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'list_tasks',
                    description: 'List all background tasks and their status',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'start_drift_detection',
                    description: 'Start a background drift detection task',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                description: 'Unique identifier for the task',
                            },
                        },
                        required: ['id'],
                    },
                },
                {
                    name: 'start_documentation_update',
                    description: 'Start a background documentation update task',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                description: 'Unique identifier for the task',
                            },
                        },
                        required: ['id'],
                    },
                },
                {
                    name: 'get_task_status',
                    description: 'Get the status and progress of a specific task',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                description: 'The task ID',
                            },
                        },
                        required: ['id'],
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            switch (request.params.name) {
                case 'list_tasks':
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(taskManager.getAllTasks(), null, 2),
                            },
                        ],
                    };

                case 'start_drift_detection': {
                    const id = request.params.arguments?.id as string;
                    if (!id) throw new McpError(ErrorCode.InvalidParams, 'Task ID is required');

                    const task = new DriftDetectionTask(id);
                    taskManager.addTask(task);

                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Task '${id}' started.`,
                            },
                        ],
                    };
                }

                case 'start_documentation_update': {
                    const id = request.params.arguments?.id as string;
                    if (!id) throw new McpError(ErrorCode.InvalidParams, 'Task ID is required');

                    const task = new DocumentationUpdateTask(id);
                    taskManager.addTask(task);

                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Documentation update task '${id}' started.`,
                            },
                        ],
                    };
                }

                case 'get_task_status': {
                    const id = request.params.arguments?.id as string;
                    if (!id) throw new McpError(ErrorCode.InvalidParams, 'Task ID is required');

                    const task = taskManager.getTask(id);
                    if (!task) {
                        return {
                            content: [{ type: 'text', text: `Task '${id}' not found.` }],
                            isError: true,
                        };
                    }

                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    id: task.id,
                                    status: task.status,
                                    progress: task.progress,
                                    error: task.error,
                                }, null, 2),
                            },
                        ],
                    };
                }

                default:
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Praxis MCP Server running on stdio');
    }
}
