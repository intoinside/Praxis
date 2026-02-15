import { initCommand } from './commands/init.js';
import { intentCreateAction } from './commands/intent/create.js';
import { intentListAction } from './commands/intent/list.js';
import { intentValidateAction } from './commands/intent/validate.js';
import { generateSlashCommandsAction } from './commands/integration/generate.js';
import { specDeriveAction } from './commands/spec/derive.js';
import { specDeleteAction } from './commands/spec/delete.js';
import { specApplyAction } from './commands/spec/apply.js';
import { specArchiveAction } from './commands/spec/archive.js';
import { specListAction } from './commands/spec/list.js';
import { specValidateAction } from './commands/spec/validate.js';
import { integrationServeAction } from './commands/integration/serve.js';
import { agentBrokerAction } from './commands/agent/broker.js';
import { agentRunAction } from './commands/agent/run.js';
import { agentPingAction } from './commands/agent/ping.js';

/**
 * Praxis Command Manifest
 * This file defines all supported commands and subcommands for the Praxis CLI.
 */


export interface CommandDefinition {
  name: string;
  description: string;
  action?: (...args: any[]) => Promise<void>;
  subcommands?: CommandDefinition[];
  options?: {
    name: string;
    description: string;
    alias?: string;
    required?: boolean;
  }[];
  arguments?: {
    name: string;
    description: string;
    required?: boolean;
  }[];
}

export const manifest: CommandDefinition[] = [
  {
    name: 'init',
    description: 'Initialize a new project to be used with Praxis',
    action: initCommand,
    arguments: [
      {
        name: 'name',
        description: 'The name of the project',
        required: false,
      }
    ]
  },
  {
    name: 'intent',
    description: 'Manage intents (the WHY)',
    subcommands: [
      {
        name: 'create',
        description: 'Create a new intent',
        action: intentCreateAction,
        arguments: [
          {
            name: 'description',
            description: 'The description of the intent to create',
            required: true,
          }
        ]
      },
      {
        name: 'update',
        description: 'Update an existing intent',
      },
      {
        name: 'validate',
        description: 'Validate an intent for completeness and consistency',
        action: intentValidateAction,
        arguments: [
          {
            name: 'intent-id',
            description: 'The ID of the intent to validate',
            required: true,
          }
        ]
      },
      {
        name: 'list',
        description: 'List all defined intents',
        action: intentListAction,
      },
      {
        name: 'check',
        description: 'Verify that current specs and code still satisfy all intents',
      },
    ],
  },
  {
    name: 'model',
    description: 'Generate or update the intent model',
    options: [
      {
        name: 'intent-id',
        description: 'The ID of the intent to model',
        required: true
      }
    ]
  },
  {
    name: 'spec',
    description: 'Manage specifications (the WHAT)',
    subcommands: [
      {
        name: 'derive',
        description: 'Generate initial specifications from an intent or intent model',
        action: specDeriveAction,
        options: [
          {
            name: 'from-intent',
            description: 'The ID of the intent or model to derive from',
            required: true,
          },
        ],
      },
      {
        name: 'refine',
        description: 'Manually refine a specification while preserving intent traceability',
      },
      {
        name: 'validate',
        description: 'Validate specs for internal consistency and completeness',
        action: specValidateAction,
        arguments: [
          {
            name: 'spec-id',
            description: 'The ID of the spec to validate',
            required: true,
          },
        ],
      },
      {
        name: 'lock',
        description: 'Lock a specification as a formal contract',
      },
      {
        name: 'list',
        description: 'List all specifications and their associated intents',
        action: specListAction,
        options: [
          {
            name: 'from-intent',
            description: 'The ID of the intent to list specs for',
            required: false,
          },
        ],
      },
      {
        name: 'check',
        description: 'Verify implementation compliance against locked specs',
      },
      {
        name: 'delete',
        description: 'Delete a specification and its artifacts',
        action: specDeleteAction,
        arguments: [
          {
            name: 'spec-id',
            description: 'The ID of the spec to delete',
            required: true,
          },
        ],
      },
      {
        name: 'archive',
        description: 'Archive a specification',
        action: specArchiveAction,
        arguments: [
          {
            name: 'spec-id',
            description: 'The ID of the spec to archive',
            required: true,
          },
        ],
      },
      {
        name: 'apply',
        description: 'Implement a specification',
        action: specApplyAction,
        arguments: [
          {
            name: 'spec-id',
            description: 'The ID of the spec to apply',
            required: true,
          },
        ],
      },
    ],
  },
  {
    name: 'agent',
    description: 'Manage background agents and the messaging broker',
    subcommands: [
      {
        name: 'broker',
        description: 'Start an embedded MQTT broker for distributed task management',
        action: agentBrokerAction,
        options: [
          {
            name: 'port',
            description: 'The port to listen on (default: 1883)',
            alias: 'p'
          }
        ]
      },
      {
        name: 'run',
        description: 'Start an agent worker to process tasks from the MQTT broker',
        action: agentRunAction
      },
      {
        name: 'ping',
        description: 'Send a PING task to the agent queue',
        action: agentPingAction
      }
    ]
  },
  {
    name: 'serve',
    description: 'Expose Praxis commands through a local service',
    action: integrationServeAction,
    options: [
      {
        name: 'no-mcp',
        description: 'Disable MCP server',
      }
    ]
  },
  {
    name: 'analyze',
    description: 'Analyze impact and drift',
    subcommands: [
      {
        name: 'impact',
        description: 'Analyze the impact of changes to an intent on specs and code',
        options: [
          {
            name: 'intent',
            description: 'The ID of the intent to analyze',
            required: true,
          },
        ],
      },
      {
        name: 'drift',
        description: 'Detect intent/spec/code drift',
      },
    ],
  },
  {
    name: 'integration',
    description: 'IDE and AI integration',
    subcommands: [
      {
        name: 'commands',
        description: 'List all available commands in machine-readable form',
      },
      {
        name: 'generate-slash-commands',
        description: 'Generate slash command definitions for IDE integration',
        action: generateSlashCommandsAction,
        arguments: [
          {
            name: 'tool',
            description: 'The tool ID (e.g., antigravity)',
            required: true,
          }
        ]
      },
    ],
  },
];
