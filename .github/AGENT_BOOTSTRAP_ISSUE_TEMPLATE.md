# Auto-Generate Repository Custom Agents

## Objective

Analyze this entire repository — its stack, architecture, file structure, patterns, dependencies, existing tests, CI/CD, and domain logic — then generate the top 10-15 most valuable custom coding agents as `.github/agents/*.agent.md` files.

## Phase 1: Repository Analysis

Before generating anything, perform a deep analysis. Identify:

1. **Stack & Runtime**: Languages, frameworks, bundlers, runtimes (e.g. React, Express, Django, Rails, Go, Rust)
2. **Architecture Pattern**: Monolith, microservices, monorepo, serverless, full-stack, API-only, static site
3. **Database & ORM**: PostgreSQL/MySQL/MongoDB/SQLite, Drizzle/Prisma/TypeORM/Sequelize/raw SQL
4. **Frontend**: Component library (shadcn, MUI, Chakra), state management, routing, SSR/CSR/SSG
5. **Auth System**: Session-based, JWT, OAuth providers, role-based access control
6. **Testing Setup**: Test runner (vitest, jest, pytest, go test), test file locations, coverage tools, e2e framework
7. **CI/CD**: GitHub Actions workflows, deployment targets, build steps
8. **API Layer**: REST routes, GraphQL schemas, tRPC routers, WebSocket handlers
9. **External Integrations**: Payment (Stripe), email, AI/ML services, cloud storage, third-party APIs
10. **Code Conventions**: File naming patterns, import style, error handling patterns, logging approach
11. **Pain Points**: Large/complex files, sparse test coverage areas, documentation gaps, tech debt indicators
12. **Domain Logic**: What the app actually does — its business rules and core workflows

Read these files if they exist to understand project context:
- `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `CLAUDE.md`, `AGENTS.md`
- `package.json` / `requirements.txt` / `go.mod` / `Cargo.toml` / `Gemfile` (dependency manifest)
- `tsconfig.json` / `vite.config.*` / `next.config.*` / `webpack.config.*` (build config)
- `.github/workflows/*.yml` (CI/CD)
- `.github/copilot-instructions.md` (existing instructions)
- Schema/model files, route files, middleware files

## Phase 2: Agent Selection Criteria

Select agents based on these priorities (highest first):

1. **High-frequency tasks** — What would developers on this repo do most often?
2. **Error-prone areas** — Where do bugs typically hide in this architecture?
3. **Stack-specific expertise** — Agents that understand this exact tech combination
4. **Quality gates** — Agents that enforce the repo's specific standards
5. **Domain awareness** — Agents that understand the business logic, not just code syntax
6. **Gap coverage** — Areas where automated help is most needed (sparse tests, no docs, complex integrations)

Do NOT generate generic agents. Every agent must reference actual file paths, actual patterns, and actual conventions found in THIS repository.

## Phase 3: Generate Agent Files

For each agent, create a file at `.github/agents/{agent-name}.agent.md` using this format:

```markdown
---
name: "Descriptive Agent Name"
description: "One sentence: what this agent does and when to use it"
---

[Detailed behavioral instructions that reference THIS repo's actual:
- File paths and directory structure
- Naming conventions and code patterns
- Existing utilities and helpers to reuse
- Testing patterns and test file locations
- Error handling conventions
- Import/export style]
```

## Required Agent Categories

Generate agents from THESE categories, selecting whichever 10-15 are most relevant to this specific repo. Skip categories that don't apply.

### Code Quality & Standards
- **Linter/Formatter Agent**: Enforces this repo's specific code style, naming conventions, and file organization patterns
- **Type Safety Agent**: Strengthens type definitions, fixes type errors, removes `any` types, adds missing interfaces

### Testing
- **Unit Test Writer**: Writes tests matching this repo's exact test framework, mock patterns, file structure, and assertion style
- **Integration/E2E Test Writer**: Creates end-to-end tests using this repo's e2e framework and test utilities
- **Test Fixer**: Diagnoses and fixes failing tests, updates snapshots, fixes mock configurations

### Feature Development
- **Frontend Component Builder**: Creates UI components following this repo's component library, styling system, and composition patterns
- **API Endpoint Builder**: Adds new routes/endpoints following this repo's routing pattern, middleware chain, validation, and response format
- **Database Migration Agent**: Creates schema changes, migrations, and updates ORM models following existing patterns
- **State Management Agent**: Implements state logic following this repo's state management approach

### Infrastructure & DevOps
- **CI/CD Agent**: Modifies GitHub Actions workflows, adds build steps, fixes pipeline failures
- **Dependency Manager**: Updates packages, resolves version conflicts, handles breaking changes in upgrades
- **Performance Optimizer**: Identifies and fixes performance bottlenecks specific to this stack

### Documentation & Communication
- **Documentation Writer**: Generates docs matching this repo's documentation style, covering API docs, component docs, architecture docs
- **PR Description Agent**: Writes detailed PR descriptions with context, changes summary, and test plan

### Security & Reliability
- **Security Auditor**: Reviews code for vulnerabilities specific to this stack (XSS, SQL injection, auth bypasses, secret exposure)
- **Error Handling Agent**: Improves error handling, adds proper error boundaries, logging, and user-facing error messages

### Domain-Specific (detect from repo analysis)
- **[Domain] Workflow Agent**: Handles business logic specific to this app's domain (e.g. payment flows, content pipelines, data processing)
- **Integration Agent**: Manages third-party API integrations found in the repo (e.g. Stripe, AWS, SendGrid)
- **Data Model Agent**: Works with this repo's specific data models, relationships, and validation rules

## Agent Prompt Quality Requirements

Each agent's prompt MUST include:

1. **Specific file paths**: "Test files go in `tests/unit/server/` mirroring `server/` structure"
2. **Actual patterns**: "Use `vi.mock('../../db')` for database mocking as seen in existing tests"
3. **Real utilities**: "Import `createTestContext` from `tests/helpers/` for request mocking"
4. **Naming conventions**: "Route files use kebab-case: `{resource}-routes.ts`"
5. **Anti-patterns**: "NEVER import from `dist/`. NEVER use `any` type. NEVER skip error handling on async routes"
6. **Verification steps**: "After changes, run `npm test` to verify. Check that `npx tsc --noEmit` passes"
7. **Framework-specific rules**: Reference the actual framework version and its idioms (e.g. Express 5 params vs Express 4)

## Phase 4: Generate Supporting Files

After creating the agents, also generate or update:

### `.github/copilot-instructions.md`
Repository-wide instructions covering:
- How to build and run the project
- How to run tests
- Code style rules
- Architecture overview (brief)
- Key conventions agents should follow

### `.github/copilot-setup-steps.yml`
Environment setup so agents can build and test:
```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4  # or appropriate runtime
    with:
      node-version: '20'  # or whatever this repo uses
  - run: npm ci  # or appropriate install command
```

## Output Checklist

Your PR should contain:
- [ ] 10-15 agent files in `.github/agents/`
- [ ] `.github/copilot-instructions.md` (created or updated)
- [ ] `.github/copilot-setup-steps.yml`
- [ ] PR description explaining each agent's purpose and when to use it

## Important Rules

- Reference REAL file paths found in this repo, not hypothetical ones
- Match ACTUAL coding patterns, not generic best practices
- If the repo has existing `AGENTS.md`, `CLAUDE.md`, or `.github/copilot-instructions.md`, read them first and ensure consistency
- Do not duplicate functionality that existing agents or instructions already cover
- Each agent should be focused — one clear responsibility, not a Swiss Army knife
- Prompts should be 500-2000 words each (detailed enough to be useful, concise enough to stay under 30k char limit)
- Use the repo's actual test commands, build commands, and lint commands — do not guess
