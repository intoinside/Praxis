# Praxis: Agent Instructions

This document provides technical context, build steps, and conventions for AI coding agents. For a high-level project overview and user-facing documentation, see [README.md](file:///p:/Praxis/README.md).

## Technical Overview
Praxis is a TypeScript-based CLI tool that bridges Intent-Driven Development (IDD) and Spec-Driven Development (SDD).

- **Runtime**: Node.js (>= 18)
- **Primary Language**: TypeScript
- **Package Manager**: npm
- **CLI Framework**: Commander.js
- **Test Runner**: Vitest

## Getting Started

### Installation
```bash
npm install
```

### Building the Project
```bash
npm run build
```
This uses `tsc` to compile TypeScript source files from `src/` to `dist/`.

### Running Tests
```bash
npm test
npm run coverage
```

## Project Structure

- `p:/Praxis/src/index.ts`: The main entry point. It dynamically registers commands from the manifest.
- `p:/Praxis/src/manifest.ts`: Central definition of all commands, subcommands, and their actions.
- `p:/Praxis/src/commands/`: Implementation of CLI command actions.
- `p:/Praxis/src/core/`: Core logic and shared utilities.
  - `p:/Praxis/src/core/utils.ts`: Centralized path constants and file system helpers.
  - `p:/Praxis/src/core/command-generation/`: Logic for generating tool-specific slash commands.

## Architecture & Conventions

### 1. Command Registration
Commands are **manifest-driven**. 
- To add a new command, define it in `src/manifest.ts`.
- Each command/subcommand should have an `action` property binding it to a function in `src/commands/`.
- `src/index.ts` automatically wires up arguments, options, and actions based on this manifest.

### 2. File & Path Management
Always use the constants and utilities defined in `src/core/utils.ts` for interacting with the `.praxis` project structure:
- `PRAXIS_DIR`: `.praxis`
- `INTENTS_DIR`: `.praxis/intents`
- `SPECS_DIR`: `.praxis/specs`
- `TEMPLATES_DIR`: `.praxis/templates`

Use `findIntentFile(intentId)` and `findAllSpecFiles()` to locate project artifacts.

### 3. Metadata Parsing
Praxis uses key-value pairs in Markdown comments for metadata. Use `parseMetadata(content)` from `src/core/utils.ts` to read metadata like `**Status**:` or `**Created**:`.

## Coding Style
- Prefer **functional patterns** for command registration and data transformation.
- Keep command actions thin; delegate complex logic to `src/core/` modules.
- Maintain **traceability** between Intents and Specs by using unified identifiers.

## Common Tasks for Agents
- **Adding a Command**: 1. Implement action in `src/commands/`. 2. Add definition to `src/manifest.ts`.
- **Modifying Templates**: Update files in `templates/` (copied to `.praxis/templates` during `init`).
- **Extending IDE Support**: Add a new adapter in `src/core/command-generation/adapters/` and register it in `registry.ts`.
