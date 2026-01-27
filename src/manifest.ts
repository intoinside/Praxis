/**
 * Praxis Command Manifest
 * This file defines all supported commands and subcommands for the Praxis CLI.
 */

export interface CommandDefinition {
  name: string;
  description: string;
  subcommands?: CommandDefinition[];
  options?: {
    name: string;
    description: string;
    alias?: string;
    required?: boolean;
  }[];
}

export const manifest: CommandDefinition[] = [
  {
    name: 'init',
    description: 'Initialize a new project to be used with Praxis',
  },
  {
    name: 'intent',
    description: 'Manage intents (the WHY)',
    subcommands: [
      {
        name: 'create',
        description: 'Create a new intent',
      },
      {
        name: 'update',
        description: 'Update an existing intent',
      },
      {
        name: 'validate',
        description: 'Validate all intents for completeness and consistency',
      },
      {
        name: 'list',
        description: 'List all defined intents',
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
        options: [
          {
            name: 'from',
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
      },
      {
        name: 'lock',
        description: 'Lock a specification as a formal contract',
      },
      {
        name: 'list',
        description: 'List all specifications and their associated intents',
      },
      {
        name: 'check',
        description: 'Verify implementation compliance against locked specs',
      },
    ],
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
        name: 'serve',
        description: 'Expose Praxis commands through a local service',
      },
      {
        name: 'commands',
        description: 'List all available commands in machine-readable form',
      },
    ],
  },
];
