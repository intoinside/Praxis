# Praxis

```
 ███████████                                   ███         
░░███░░░░░███                                 ░░░          
 ░███    ░███ ████████   ██████   █████ █████ ████   █████ 
 ░██████████ ░░███░░███ ░░░░░███ ░░███ ░░███ ░░███  ███░░  
 ░███░░░░░░   ░███ ░░░   ███████  ░░░█████░   ░███ ░░█████ 
 ░███         ░███      ███░░███   ███░░░███  ░███  ░░░░███
 █████        █████    ░░████████ █████ █████ █████ ██████ 
░░░░░        ░░░░░      ░░░░░░░░ ░░░░░ ░░░░░ ░░░░░ ░░░░░░  
```

**Praxis** is a development framework that bridges **Intent‑Driven Development (IDD)** and **Spec‑Driven Development (SDD)** into a single, coherent workflow.

It relays on [Intended](https://github.com/Nom-nom-hub/Intended) and [OpenSpec](https://github.com/Fission-AI/OpenSpec).

Praxis helps teams start from *why* they are building something, derive *what* must be built in the form of explicit specifications, and continuously verify that the *how* (the code) never diverges from the original intent.

It is designed to be:

* **AI‑native** (usable from AI chats inside modern IDEs)
* **CLI‑first** (works without any IDE or AI integration)
* **Intent‑centric** (intent is the primary source of truth)

---

## Core Concepts

### Intent

An **Intent** describes the purpose, value, and constraints of a feature or system.
It answers the question:

> *Why are we building this?*

Intents are technology‑agnostic and do not describe APIs, UI, or implementation details.

---

### Specification (Spec)

A **Specification** is a formal, verifiable description derived from an Intent.
It answers the question:

> *What must the system do to satisfy the intent?*

Specs act as contracts and can be translated into:

* behavioral rules
* acceptance criteria
* API contracts
* test cases

---

### Drift Detection

Praxis continuously checks for **semantic drift**:

* specs that no longer satisfy the intent
* code that implements features not justified by any intent

---

## What Praxis Provides

### 1. Intent Management

* Create, update, and validate intents
* Enforce intent structure and clarity
* Track intent evolution over time

### 2. Intent Modeling

* Extract capabilities, events, and states from intents
* Provide a bridge between intent and specification

### 3. Spec Derivation

* Generate initial specifications from intents
* Maintain traceability between intents and specs
* Support manual refinement without losing intent linkage

### 4. Spec Validation

* Lock specs as formal contracts
* Validate implementations against specs
* Detect missing or incomplete implementations

### 5. Drift Analysis

* Detect features not backed by intent
* Detect intents no longer satisfied by current specs

### 6. AI & IDE Integration

* Slash‑command friendly design
* CLI commands that can be mapped to IDE AI chats
* Optional exposure as a local command server (e.g. MCP‑style)

```
.praxis/
├── intents/
│   ├── wip/             # Work-in-progress intents
│   └── archive/         # Archived intents
├── specs/               # Specifications (OpenSpec)
│   ├── wip/             # Work-in-progress specs
│   └── archive/         # Archived specs
└── templates/           # Templates for intents and specs
```

### Intent Commands

```bash
praxis init
```

Initialize a new project to be used with Praxis. Templates are provided in the `templates` directory.

```bash
praxis intent create <intent-description>
```

Create a new intent.

```bash
praxis intent update <intent-id>
```

Update an existing intent.

```bash
praxis intent validate
```

Validate all intents for completeness and consistency.

```bash
praxis intent list
```

List all defined intents.

```bash
praxis intent check
```

Verify that current specs and code still satisfy all intents.

---

### Intent Modeling Commands

```bash
praxis intent model <intent-id>
```

Generate or update the intent model (capabilities, events, states).

---

### Specification Commands

```bash
praxis spec derive --from <intent-id>
```

Generate initial specifications from an intent or intent model.

```bash
praxis spec refine <spec-id>
```

Manually refine a specification while preserving intent traceability.

```bash
praxis spec validate
```

Validate specs for internal consistency and completeness.

```bash
praxis spec lock <spec-id>
```

Lock a specification as a formal contract.

```bash
praxis spec list
```

List all specifications and their associated intents.

```bash
praxis spec check
```

Verify implementation compliance against locked specs.

---

### Analysis Commands

```bash
praxis analyze impact --intent <intent-id>
```

Analyze the impact of changes to an intent on specs and code.

```bash
praxis analyze drift
```

Detect intent/spec/code drift.

---

### Integration & Runtime Commands

```bash
praxis serve
```

Expose Praxis commands through a local service for IDE or AI integration.

```bash
praxis commands
```

List all available commands in machine‑readable form.

---

## Slash Command Usage (IDE / AI Chat)

When integrated into an IDE or AI‑enabled editor, Praxis commands can be invoked as slash commands:

```
/praxis intent create
/praxis spec derive
/praxis intent check
```

The underlying behavior is identical to the CLI.

---

## Development Flow Overview

The following diagram illustrates how **Intents** and **Specifications** integrate into a standard development lifecycle.

```
        ┌────────────┐
        │   Intent   │
        │   (WHY)    │
        └─────┬──────┘
              │
              ▼
     ┌──────────────────┐
     │ Intent Modeling  │
     │ (Capabilities,   │
     │  Events, States) │
     └────────┬─────────┘
              │
              ▼
        ┌────────────┐
        │   Specs    │
        │   (WHAT)   │
        └─────┬──────┘
              │
   ┌──────────┼──────────┐
   │          │          │
   ▼          ▼          ▼
Tests     Contracts   Scenarios

              │
              ▼
        ┌────────────┐
        │    Code    │
        │   (HOW)    │
        └─────┬──────┘
              │
              ▼
     ┌─────────────────┐
     │ Validation &    │
     │ Drift Detection │
     └─────┬───────────┘
           │
           └───────────────┐
                           ▼
                     Intent Check
```

### How Praxis Fits into Daily Development

* **Before coding**: intents and specs are defined and validated
* **During coding**: specs act as executable and contractual guidance
* **After changes**: drift detection ensures alignment with original intent

This allows Praxis to integrate seamlessly with existing workflows such as:

* Agile / Scrum
* TDD / BDD
* CI/CD pipelines

---

## Design Philosophy

* **Intent is sacred**: everything must trace back to a reason.
* **Specs are contracts**: informal requirements are not enough.
* **Code must justify itself**: no feature without intent.
* **AI is an assistant, not the authority**: Praxis remains deterministic and auditable.

---

## Installation

Praxis is written in **TypeScript** and distributed as a **Node.js CLI**.

### Prerequisites

* Node.js **>= 18**
* npm (or compatible package manager)

You can verify your environment with:

```
node --version
npm --version
```

---

### Install (Global)

To install Praxis globally and make the `praxis` command available system-wide:

```
npm install -g praxis
```

After installation, verify it works:

```
praxis --help
```

---

### Install (Project-local)

You can also install Praxis as a development dependency inside a project:

```
npm install --save-dev praxis
```

Then run it via:

```
npx praxis --help
```

---

### Using with IDEs and AI Chats

When installed locally or globally, Praxis commands can be mapped to:

* IDE extensions (e.g. VS Code)
* AI chat slash commands
* local tool servers (e.g. via `praxis serve`)

The installation method does not change Praxis behavior; it only affects how commands are invoked.

---

## Status

Praxis is under active development.
APIs, command names, and file formats may evolve.
