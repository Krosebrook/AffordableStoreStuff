# Deployment Stacks & AI Developer Reference (2026)

> **Last Updated**: February 8, 2026
> **Project**: FlashFusion v3.0.0 (AffordableStoreStuff)
> **Current Stack**: React 18 + Vite + Express 5 + PostgreSQL (Drizzle ORM)

---

## Table of Contents

1. [What Your App Architecture Is Called](#1-what-your-app-architecture-is-called)
2. [The Two Types of PWAs](#2-the-two-types-of-pwas)
3. [Android Mobile App Stacks (Top 3)](#3-android-mobile-app-stacks-top-3)
4. [Progressive Web App Stacks (Top 3)](#4-progressive-web-app-stacks-top-3)
5. [Desktop Installable App Stacks (Top 3)](#5-desktop-installable-app-stacks-top-3)
6. [Deployment Platform Cheat Sheet](#6-deployment-platform-cheat-sheet)
7. [Claude Code CLI Ecosystem](#7-claude-code-cli-ecosystem)
8. [Gemini CLI Ecosystem](#8-gemini-cli-ecosystem)
9. [Agent Orchestration Frameworks](#9-agent-orchestration-frameworks)
10. [MCP (Model Context Protocol) Ecosystem](#10-mcp-model-context-protocol-ecosystem)
11. [Spec-Driven Development](#11-spec-driven-development)
12. [AI CLI Developer Workflow](#12-ai-cli-developer-workflow)
13. [Developer Setup Checklist](#13-developer-setup-checklist)
14. [FlashFusion Recommended Path](#14-flashfusion-recommended-path)
15. [Sources](#15-sources)

---

## 1. What Your App Architecture Is Called

Your FlashFusion app is a **Monolithic Fullstack Node.js Application** (also called a "unified server" or "traditional server-rendered SPA").

Specifically:
- **Backend**: Express.js REST API server (long-running process)
- **Frontend**: React SPA (Single Page Application) built with Vite
- **Pattern**: Express serves both API (`/api/*`) and static React build (`dist/public/`) from a single process on a single port
- **Database**: PostgreSQL with Drizzle ORM
- **Session**: Server-side sessions (stateful, stored in PostgreSQL)

This is the **opposite** of serverless/JAMstack architecture (Vercel, Cloudflare Pages, Netlify are built for serverless).

**Other names for this pattern:**
- "Monolith" (vs microservices)
- "Traditional server" (vs serverless)
- "Fullstack Express app"

**Why Vercel can't run this as-is:**
- Express is a long-running process; Vercel runs serverless functions (max 10s-300s)
- WebSockets (`ws`) require persistent connections
- `express-session` + `connect-pg-simple` need a persistent process
- The scheduler (`scheduling-service.ts`) needs a cron-like background process
- Vercel's serverless model can't maintain in-memory state between requests

---

## 2. The Two Types of PWAs

### Type 1: Browser-Installed PWA ("Add to Home Screen" / Standalone)
- User visits your website in Chrome/Edge/Safari
- Browser prompts "Install this app" (or user clicks install button)
- App gets its **own window** (no browser URL bar) via `display: standalone` in manifest
- Has its own icon on desktop/home screen
- Works offline via Service Worker
- **This is the "real" PWA** most people mean

### Type 2: Browser Shortcut / Pinned Tab ("Minimal UI" or "Browser" display)
- Just a bookmark/shortcut that opens the site in the browser
- URL bar is visible, feels like a website
- Set via `display: browser` or `display: minimal-ui` in manifest
- Less "app-like", more "website with an icon"
- Still can work offline if Service Worker is configured

### Bonus: TWA (Trusted Web Activity)
- Wraps a PWA inside a native Android app shell
- Distributed through the **Google Play Store**
- Uses Chrome under the hood but looks fully native
- Built with Android Studio + Bubblewrap CLI
- This is how you get a PWA into the Play Store

---

## 3. Android Mobile App Stacks (Top 3)

### A1. React Native + Expo (Best for JS/TS developers)

```
Stack:
  Framework:    Expo SDK 52+ / React Native 0.77+ (New Architecture by default)
  Language:     TypeScript
  UI:           React Native Paper / NativeWind (Tailwind for RN)
  Navigation:   Expo Router (file-based routing)
  State:        Zustand or TanStack Query
  Backend:      Any REST/GraphQL API
  Auth:         Clerk, Supabase Auth, or Firebase Auth
  Database:     Supabase (PostgreSQL), Firebase, or your own API
  OTA Updates:  EAS Update (over-the-air updates without Play Store review)
  Performance:  40% faster startup, 30% smaller bundles (SDK 52+)

Build & Deploy:
  Build:        EAS Build (cloud) -- eas build --platform android
  Submit:       EAS Submit -- eas submit --platform android
  Deploy to:    Google Play Store, APK direct download
  CI/CD:        GitHub Actions + EAS CLI

Scaffold:
  npx create-expo-app@latest MyApp --template tabs
  cd MyApp
  npx expo install expo-router expo-dev-client
```

### A2. Flutter (Best cross-platform, single codebase)

```
Stack:
  Framework:    Flutter 3.27+
  Language:     Dart
  UI:           Material 3 / Cupertino widgets
  Navigation:   GoRouter
  State:        Riverpod 2.0 or Bloc
  Backend:      Any REST/GraphQL API
  Auth:         Firebase Auth, Supabase Auth, Appwrite
  Database:     Firebase Firestore, Supabase, or REST API
  Local DB:     Drift (SQLite), Hive, or Isar
  Performance:  Slight edge in raw benchmarks, AOT compiled

Build & Deploy:
  Build:        flutter build apk / flutter build appbundle
  Deploy to:    Google Play Store (AAB), direct APK download
  CI/CD:        GitHub Actions + Fastlane, Codemagic, or Bitrise

Scaffold:
  flutter create --org com.yourcompany --template app my_app
  cd my_app
  flutter pub add go_router riverpod firebase_core
```

### A3. Kotlin + Jetpack Compose (Native Android, best performance)

```
Stack:
  Framework:    Jetpack Compose (latest BOM)
  Language:     Kotlin
  UI:           Material 3 Compose
  Navigation:   Compose Navigation
  State:        ViewModel + StateFlow / Hilt DI
  Networking:   Ktor Client or Retrofit
  Auth:         Firebase Auth, custom JWT
  Local DB:     Room (SQLite)
  Async:        Kotlin Coroutines + Flow

Build & Deploy:
  Build:        Android Studio -> Build -> Generate Signed APK/AAB
  Deploy to:    Google Play Store
  CI/CD:        GitHub Actions + Gradle

Scaffold:
  Android Studio -> New Project -> Empty Compose Activity
```

**When to choose which:**
- **React Native/Expo**: Your team knows JS/TS, you want fastest time-to-market, you need OTA updates
- **Flutter**: You want one codebase for mobile + desktop + web, custom UI design matters
- **Kotlin Compose**: You only need Android, you want best performance, you need deep OS integration

---

## 4. Progressive Web App Stacks (Top 3)

### B1. Next.js + Serwist (Best for Vercel deployment)

```
Stack:
  Framework:    Next.js 16+ (App Router)
  Language:     TypeScript
  UI:           Tailwind CSS + shadcn/ui
  PWA:          Serwist (successor to next-pwa, fork of Workbox)
  State:        TanStack Query + Zustand
  Auth:         NextAuth.js v5 (Auth.js) or Clerk
  Database:     Prisma + PostgreSQL (Supabase/Neon)
  Manifest:     next.config.js + public/manifest.json

Deploy Platform: VERCEL (native, zero-config)
  Build:        next build
  PWA Install:  Browser "Install" prompt (standalone)

Scaffold:
  npx create-next-app@latest my-pwa --typescript --tailwind --app
  cd my-pwa
  npm install @serwist/next serwist
  # Add manifest.json to public/
  # Configure service worker in src/app/sw.ts
```

### B2. SvelteKit + Vite PWA Plugin (Fastest, smallest bundle)

```
Stack:
  Framework:    SvelteKit 2+ / Svelte 5 (runes)
  Language:     TypeScript
  UI:           Tailwind CSS + Skeleton UI or shadcn-svelte
  PWA:          @vite-pwa/sveltekit (vite-plugin-pwa, supports SvelteKit 2+)
  State:        Svelte stores / runes ($state, $derived)
  Auth:         Lucia Auth or Auth.js
  Database:     Drizzle + PostgreSQL (Neon/Supabase)

Deploy Platform: CLOUDFLARE PAGES (best, edge-first)
  Build:        vite build
  PWA Install:  Automatic via vite-plugin-pwa

Scaffold:
  npx sv create my-pwa
  cd my-pwa
  npm install -D vite-plugin-pwa @vite-pwa/sveltekit
```

### B3. Nuxt 3 + Vite PWA Plugin (Vue ecosystem, great DX)

```
Stack:
  Framework:    Nuxt 3.14+
  Language:     TypeScript
  UI:           Tailwind CSS + Nuxt UI
  PWA:          @vite-pwa/nuxt
  State:        Pinia + useState composable
  Auth:         nuxt-auth-utils or Sidebase Auth
  Database:     Drizzle + PostgreSQL via Nitro server routes

Deploy Platform: CLOUDFLARE PAGES or VERCEL
  Build:        nuxt build (Node server) or nuxt generate (static)
  PWA Install:  Automatic via @vite-pwa/nuxt

Scaffold:
  npx nuxi@latest init my-pwa
  cd my-pwa
  npx nuxi module add @vite-pwa/nuxt
  npx nuxi module add @nuxt/ui
```

---

## 5. Desktop Installable App Stacks (Top 3)

### C1. Tauri 2.0 (Recommended -- smallest, fastest, most secure)

```
Stack:
  Framework:    Tauri 2.0+
  Shell:        Rust (system backend) + Web frontend
  Frontend:     React/Svelte/Vue + Vite (your choice)
  Language:     TypeScript (frontend) + Rust (backend/system APIs)
  UI:           Tailwind CSS + any web UI library
  Local DB:     SQLite via tauri-plugin-sql, or tauri-plugin-store
  Updates:      tauri-plugin-updater (auto-updates with signature verification)
  Security:     Capabilities-based permission system (v2.0)
  Bundle Size:  3-10 MB (vs 150MB+ for Electron)
  RAM:          ~30-80 MB idle
  Startup:      <0.5s

Build & Deploy:
  Build:        cargo tauri build
  Output:       .msi (Windows), .dmg (macOS), .deb/.AppImage (Linux)
  Deploy to:    GitHub Releases, Microsoft Store, your website
  CI/CD:        GitHub Actions (tauri-action builds all platforms)

Scaffold:
  npm create tauri-app@latest my-desktop-app
  cd my-desktop-app
  npm install
  cargo tauri dev
```

### C2. Electron + Electron Forge (Most mature, largest ecosystem)

```
Stack:
  Framework:    Electron 33+
  Frontend:     React/Vue + Vite
  Language:     TypeScript
  UI:           Any web UI library (shadcn, MUI, etc.)
  Local DB:     better-sqlite3, electron-store
  Updates:      electron-updater (autoUpdater)
  Bundle Size:  150-300 MB (includes Chromium)
  RAM:          ~150-400 MB idle
  Startup:      1-2s
  Notable Apps: VS Code, Slack, Discord, Figma, Notion, 1Password, Spotify

Build & Deploy:
  Build:        npx electron-forge make
  Output:       .exe/.msi (Windows), .dmg (macOS), .deb/.snap (Linux)
  Deploy to:    GitHub Releases, app stores
  CI/CD:        GitHub Actions + electron-forge publish

Scaffold:
  npm init electron-app@latest my-desktop-app -- --template=vite-typescript
  cd my-desktop-app
  npm install
```

### C3. Flutter Desktop (Single codebase: mobile + desktop + web)

```
Stack:
  Framework:    Flutter 3.27+ (desktop support stable)
  Language:     Dart
  UI:           Material 3 / fluent_ui (Windows-native look)
  State:        Riverpod or Bloc
  Local DB:     Drift (SQLite), Hive
  Updates:      Custom (check GitHub Releases API) or MSIX auto-update
  Bundle Size:  20-40 MB
  RAM:          ~50-120 MB idle
  Startup:      1-2s

Build & Deploy:
  Build:        flutter build windows / flutter build macos
  Output:       .msix (Windows), .dmg (macOS), .snap (Linux)
  Deploy to:    Microsoft Store (MSIX), GitHub Releases
  CI/CD:        GitHub Actions + flutter build

Scaffold:
  flutter create --platforms=windows,macos,linux my_desktop_app
  cd my_desktop_app
  flutter pub add fluent_ui riverpod drift
```

### Head-to-Head Comparison

| Feature | Tauri 2.0 | Electron | Flutter Desktop |
|---------|-----------|----------|-----------------|
| **Hello World Size** | ~3-8 MB | ~150-250 MB | ~20-40 MB |
| **RAM (Idle)** | ~30-80 MB | ~150-400 MB | ~50-120 MB |
| **Startup Time** | ~0.5s | ~2-4s | ~1-2s |
| **Backend Language** | Rust | JavaScript/TS | Dart |
| **Frontend Language** | JS/TS (web) | JS/TS (web) | Dart |
| **Mobile Support** | Yes (v2.0) | No | Yes (primary) |
| **Web Support** | No | No | Yes |
| **Auto-Update** | Built-in (signed) | Mature | Manual/Community |
| **Security Model** | Excellent (Capabilities) | Good | Good (compiled) |
| **Learning Curve** | Medium-High (Rust) | Low (JS/TS) | Medium (Dart) |
| **GitHub Stars** | ~85k+ | ~115k+ | ~165k+ |

**When to choose:**
- **Tauri**: Bundle size matters, need strong security, willing to learn Rust
- **Electron**: Team is JS/TS, need npm ecosystem, building VS Code-like app
- **Flutter Desktop**: Need mobile + desktop from one codebase

---

## 6. Deployment Platform Cheat Sheet

| Platform | Best For | Pricing (2026) | Key Features |
|----------|----------|-----------------|--------------|
| **Vercel** | Next.js, serverless | Free tier + $20/mo Pro (usage-based) | Serverless functions, Edge, Cron |
| **Cloudflare Pages** | SvelteKit, Nuxt, edge apps | Generous free tier | Workers, KV, D1, R2 |
| **Netlify** | Static sites, JAMstack | Free tier + $19/mo Pro | Serverless functions, forms |
| **Railway** | Express, Django, Rails (traditional) | No free tier, ~$5-25/mo | Persistent servers, PostgreSQL, Redis |
| **Render** | Traditional servers, Docker | $19/mo baseline (non-free) | Persistent servers, managed DBs |
| **Fly.io** | Edge servers, WebSockets | No free tier new accounts, ~$2-5/mo | VMs at edge, per-second billing |
| **Google Play Store** | Android apps | $25 one-time | APK/AAB distribution |
| **GitHub Releases** | Desktop apps, CLIs | Free | Binary hosting, auto-update |
| **Microsoft Store** | Windows desktop apps | Free (individuals) | MSIX packages |

### Platform <-> Stack Matching

```
Next.js App Router        -> Vercel (native) or Cloudflare Pages
SvelteKit                 -> Cloudflare Pages (best) or Vercel
Nuxt 3                    -> Cloudflare Pages or Vercel
Remix                     -> Cloudflare Workers or Vercel
Express/Fastify server    -> Railway, Render, or Fly.io  <-- YOUR APP
React Native / Expo       -> Google Play Store
Flutter mobile            -> Google Play Store, App Store
Tauri desktop             -> GitHub Releases + auto-update
Electron desktop          -> GitHub Releases or app stores
```

### FlashFusion Deployment Strategy
```
FRONTEND (React SPA)      -> Vercel (free tier, CDN)
BACKEND  (Express API)    -> Railway ($5-25/mo, persistent)
DATABASE (PostgreSQL)     -> Railway (managed) or Supabase/Neon
STATE    (sessions)       -> Railway (connect-pg-simple on same DB)
```

---

## 7. Claude Code CLI Ecosystem

### Installation & Basics

```bash
npm install -g @anthropic-ai/claude-code
claude                    # Interactive mode
claude -p "prompt"        # One-shot mode
cat file | claude -p ""   # Pipe mode
claude --continue         # Continue previous conversation
claude --resume           # Resume session
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project root instructions (checked into git) |
| `~/.claude/CLAUDE.md` | Global instructions (all projects) |
| `~/.claude/settings.json` | Global settings (permissions, hooks) |
| `.claude/settings.json` | Project settings |
| `~/.claude/mcp-config.json` | MCP server configuration |
| `~/.claude/projects/<path>/memory/MEMORY.md` | Project memory (persists across conversations) |
| `~/.claude/plans/*.md` | Plan mode documents |

### Built-in Slash Commands

| Command | Description |
|---------|-------------|
| `/commit` | Analyze changes, create git commit |
| `/pr` | Create a pull request |
| `/review-pr` | Review a pull request |
| `/plan` | Toggle plan mode (read-only research) |
| `/fast` | Toggle fast output mode |
| `/compact` | Compress conversation context |

### Current Model: Claude Opus 4.6

Latest model IDs (Feb 2026):
- `claude-opus-4-6` - Most capable, complex tasks
- `claude-sonnet-4-5-20250929` - Fast, balanced
- `claude-haiku-4-5-20251001` - Fastest, cheapest

### Claude Agent SDK (Feb 2026)

The SDK was rebranded from "Claude Code SDK" to "Claude Agent SDK" on Feb 6, 2026.

```bash
# TypeScript
npm install @anthropic-ai/claude-code

# Python
pip install claude-agent-sdk
```

```typescript
import { claude } from "@anthropic-ai/claude-code";

// Basic usage
const result = await claude({
  prompt: "Add authentication to the API",
  options: {
    allowedTools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
    maxTurns: 30,
  }
});

// Multi-agent orchestration
const [frontend, backend] = await Promise.all([
  claude({ prompt: "Implement frontend auth", cwd: "client/" }),
  claude({ prompt: "Implement backend auth", cwd: "server/" }),
]);
```

### Key Features (2026)

- **Automatic Memories**: Claude records and recalls context as it works
- **Skill Hot-Reload**: Skills in `~/.claude/skills` are immediately available without restart
- **Subagent Resume**: Subagents can be resumed with full context preserved
- **Agent Teams**: Research preview for multi-agent collaboration
- **Apple Xcode Integration**: Xcode 26.3 integrates via MCP
- **Hooks**: PreToolUse, PostToolUse, Notification, Stop lifecycle events
- **Plugins**: Extensible via `~/.claude/plugins/` marketplace

### Hooks Configuration

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "python3 /path/to/validate-command.py"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "node /path/to/audit-logger.js"
      }]
    }]
  }
}
```

### Claude Artifacts & Canvas

- **Artifacts**: Web-only (claude.ai) -- generates self-contained code, docs, HTML apps, React components, SVG, Mermaid diagrams in a side panel
- **Canvas**: Web-only -- collaborative editing workspace with inline suggestions and version history
- **CLI Equivalents**: `Write` tool (create files), `Edit` tool (inline editing), `Read` + `Edit` workflow (iterative refinement)

---

## 8. Gemini CLI Ecosystem

### Installation & Basics

```bash
# Install (npm package: @google/gemini-cli)
npm install -g @google/gemini-cli

# Launch interactive mode
gemini

# One-shot
gemini "explain this codebase"

# Pipe input
cat error.log | gemini "what's causing this error?"
```

- **Current Version**: v0.27.3 (Feb 2026)
- **Model**: Gemini 3 (1M token context window)
- **Free Tier**: 60 requests/min, 1,000 requests/day with Google account
- **Auth**: Google OAuth or `GEMINI_API_KEY` environment variable
- **Repository**: https://github.com/google-gemini/gemini-cli

### Key Features

- **Free Gemini 3 Access**: No paid subscription required for basic use
- **1M Token Context**: Can ingest entire codebases
- **MCP Support**: Compatible with same MCP servers as Claude Code
- **GEMINI.md**: Project-level instructions (equivalent to CLAUDE.md)
- **Built-in Tools**: Google Search grounding, file ops, shell commands, web fetch
- **Multi-modal**: Images, screenshots, docs
- **Event-Driven Scheduler**: For tool execution (new in 2026)

### Gemini SDK (Google AI SDK)

```bash
# TypeScript
npm install @google/genai

# Python
pip install google-genai
```

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Basic generation
const response = await ai.models.generateContent({
  model: "gemini-2.5-pro",
  contents: "Explain this code",
});

// Streaming
const stream = await ai.models.generateContentStream({
  model: "gemini-2.5-flash",
  contents: "Write a REST API",
});
for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}
```

### Google Agent Development Kit (ADK)

```bash
pip install google-adk
```

```python
from google.adk import Agent, Tool

@Tool
def search_codebase(query: str) -> str:
    """Search the codebase for relevant code."""
    pass

agent = Agent(
    model="gemini-2.5-pro",
    tools=[search_codebase],
    system_instruction="You are a code review agent..."
)
response = agent.run("Review the latest PR")
```

### Gemini Code Assist (IDE Extension)

- Available for VS Code, JetBrains, Android Studio
- Free tier with generous limits
- Features: code completion, `@workspace` queries, test generation, git integration

### Claude Code vs Gemini CLI

| Aspect | Claude Code | Gemini CLI |
|--------|-------------|------------|
| **Cost** | API credits or Pro/Max | Free tier available |
| **Context Window** | 200K tokens | 1M tokens |
| **Config File** | `CLAUDE.md` | `GEMINI.md` |
| **MCP Support** | Yes | Yes |
| **Model** | Claude Opus 4.6 | Gemini 3 |
| **Package** | `@anthropic-ai/claude-code` | `@google/gemini-cli` |
| **Open Source** | Source-available | Apache 2.0 |
| **Agent SDK** | Claude Agent SDK | Google ADK |
| **Best For** | Complex reasoning, code quality | Large context, multimodal |

---

## 9. Agent Orchestration Frameworks

### Framework Comparison (2026)

| Framework | Language | Philosophy | Best For |
|-----------|----------|-----------|----------|
| **CrewAI** | Python | Role-based teams | Business workflows, content |
| **LangGraph** | Python + TypeScript | Graph-based workflows | Complex pipelines, enterprise |
| **AutoGen** | Python | Conversational agents | Code generation, research |
| **OpenAI Swarm** | Python | Agent handoffs | Educational, simple routing |
| **Mastra** | TypeScript | Native MCP support | TS-native agent workflows |
| **Vercel AI SDK** | TypeScript | Streaming + tools | Web app AI features |

### CrewAI (Role-Based Multi-Agent)

```bash
pip install crewai crewai-tools
```

```python
from crewai import Agent, Task, Crew, Process

researcher = Agent(
    role="Senior Researcher",
    goal="Research AI frameworks",
    tools=[search_tool, scrape_tool],
    llm="claude-3-5-sonnet"
)

writer = Agent(
    role="Technical Writer",
    goal="Write comprehensive reports",
    llm="claude-3-5-sonnet"
)

crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process=Process.sequential
)
result = crew.kickoff()
```

**Strengths**: Intuitive role model, built-in memory, easy collaboration patterns
**Weaknesses**: Python-only, overhead for simple tasks

### LangGraph (Graph-Based Workflows)

```bash
pip install langgraph        # Python
npm install @langchain/langgraph  # TypeScript
```

```typescript
import { StateGraph, END } from "@langchain/langgraph";

const graph = new StateGraph({ channels: { messages: { reducer: (a, b) => [...a, ...b] } } })
  .addNode("plan", planNode)
  .addNode("code", codeNode)
  .addNode("review", reviewNode)
  .addEdge("plan", "code")
  .addEdge("code", "review")
  .addConditionalEdges("review", shouldRevise, { revise: "code", end: END });
```

**Strengths**: Maximum control, TypeScript + Python, built-in persistence, LangGraph Studio debugger
**Weaknesses**: Steeper learning curve, more boilerplate

### AutoGen (Conversational Agents)

```bash
pip install autogen-agentchat  # v0.4+
```

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat

planner = AssistantAgent("planner", model_client=model, system_message="Plan implementation")
coder = AssistantAgent("coder", model_client=model, system_message="Write code")

team = RoundRobinGroupChat([planner, coder], termination_condition=termination)
result = await team.run(task="Build user auth")
```

**Strengths**: Flexible conversations, Docker sandboxes, AutoGen Studio (no-code builder)
**Weaknesses**: v0.4 breaking changes, can drift without good termination

### Multi-Agent Patterns

```
Pattern 1: Supervisor-Worker
  Supervisor -> Worker A (frontend) + Worker B (backend) + Worker C (tests)

Pattern 2: Pipeline (Sequential)
  Analyze -> Plan -> Implement -> Review

Pattern 3: Peer Review
  Implementer <-> Reviewer (iterate until quality met)

Pattern 4: Specialist Swarm
  Router -> Security + Performance + Accessibility + Docs specialists
```

### Choosing a Framework

- **Enterprise, compliance, production**: LangGraph (most control, persistent workflows)
- **Fast prototyping, intuitive teams**: CrewAI (role-based, quick to set up)
- **Iterative refinement, code gen**: AutoGen (conversation-driven)
- **TypeScript-native stack**: LangGraph or Mastra
- **Web app AI features**: Vercel AI SDK

---

## 10. MCP (Model Context Protocol) Ecosystem

### What Is MCP?

MCP is an open protocol created by Anthropic that standardizes how AI models connect to external tools and data sources. Think of it as **"USB-C for AI"** -- a universal connector.

- **Official Site**: https://modelcontextprotocol.io
- **Official Registry**: https://registry.modelcontextprotocol.io
- **GitHub**: https://github.com/modelcontextprotocol
- **Ecosystem**: Tens of thousands of community-built servers

### Architecture

```
AI Application (Claude Code, Gemini CLI, Cursor, etc.)
  |
  v
MCP Client (built into host app)
  |  JSON-RPC 2.0 over stdio/SSE
  v
MCP Server (external tool/service)
```

### MCP Primitives

| Primitive | Description | Example |
|-----------|-------------|---------|
| **Tools** | Functions the AI can call | `read_file`, `query_database` |
| **Resources** | Data the AI can read | Files, DB records, API responses |
| **Prompts** | Pre-built prompt templates | "Summarize this PR" |

### Essential MCP Servers for Fullstack Developers

**Tier 1 (Install First):**

| Server | Package | Purpose |
|--------|---------|---------|
| Filesystem | `@modelcontextprotocol/server-filesystem` | File operations outside working dir |
| GitHub | `@modelcontextprotocol/server-github` | Issues, PRs, code search |
| PostgreSQL | `@modelcontextprotocol/server-postgres` | Query databases, inspect schemas |
| Brave Search | `@modelcontextprotocol/server-brave-search` | Web search from Claude |
| Memory | `@modelcontextprotocol/server-memory` | Persistent knowledge graph |

**Tier 2 (Highly Recommended):**

| Server | Package | Purpose |
|--------|---------|---------|
| SQLite | `@modelcontextprotocol/server-sqlite` | Local database operations |
| Playwright | `@modelcontextprotocol/server-puppeteer` | Browser automation |
| Fetch | `@modelcontextprotocol/server-fetch` | HTTP requests |
| Sequential Thinking | `@modelcontextprotocol/server-sequential-thinking` | Enhanced reasoning |

### Configuration (`~/.claude/mcp-config.json`)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}" }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}" }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": { "BRAVE_API_KEY": "${BRAVE_API_KEY}" }
    }
  }
}
```

### Building a Custom MCP Server

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "my-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "get_weather",
    description: "Get weather for a city",
    inputSchema: {
      type: "object",
      properties: { city: { type: "string" } },
      required: ["city"]
    }
  }]
}));

server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "get_weather") {
    return { content: [{ type: "text", text: `Weather: 72F, sunny` }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### MCP Registries & Directories

| Registry | URL | Description |
|----------|-----|-------------|
| Official Registry | registry.modelcontextprotocol.io | Anthropic-maintained |
| Awesome MCP Servers | github.com/punkpeye/awesome-mcp-servers | 40k+ stars, community |
| Smithery | smithery.ai | MCP marketplace |
| Glama | glama.ai/mcp/servers | Directory |

### Why MCP Matters
1. **Universal**: Write a tool once, use with Claude, Gemini, Cursor, Windsurf, Zed
2. **Secure**: Servers run locally, you control data exposure
3. **Composable**: Mix and match servers for exact needs
4. **Growing**: Tens of thousands of servers, official registry launching
5. **Industry-adopted**: Cursor, Windsurf, Zed, Replit, Sourcegraph

---

## 11. Spec-Driven Development

### What It Is

Spec-driven development uses structured specification documents (PRDs, feature specs, architecture docs) to guide AI-assisted code generation. Instead of asking AI to "build a feature", you give it a detailed spec that defines requirements, acceptance criteria, and constraints.

### Workflow

```
1. Write Feature Spec (PRD/spec.md)
2. Feed to AI CLI (claude -p "implement per spec")
3. AI reads spec + codebase, plans implementation
4. AI implements, following spec constraints
5. AI writes tests per acceptance criteria
6. Human reviews output
```

### Spec Template

```markdown
# Feature: [Name]

## Overview
Brief description of what this feature does.

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## API Contract
POST /api/feature
Request: { field1: string, field2: number }
Response: { id: string, status: "success" }

## Database Changes
- New table: `feature_table` (columns: ...)
- Index on: `user_id`

## UI Components
- FeatureCard component in client/src/components/
- New page: client/src/pages/feature.tsx

## Acceptance Criteria
- [ ] User can create feature via form
- [ ] Data persists across sessions
- [ ] Error states are handled

## Constraints
- Must use existing auth middleware
- Must follow Express Router pattern in server/routes/
- No new npm dependencies unless justified
```

### Key Repos for Spec-Driven AI Development

| Repo | Description |
|------|-------------|
| `gpt-engineer-org/gpt-engineer` | Spec-to-codebase generation |
| `Pythagora-io/gpt-pilot` | AI dev that builds apps step-by-step |
| `All-Hands-AI/OpenHands` | Open-source AI software engineer |
| `cline/cline` | Autonomous AI coding agent (VS Code) |
| `aider-ai/aider` | AI pair programming in terminal |
| `block/goose` | Block's AI agent for dev tasks |

---

## 12. AI CLI Developer Workflow

### Combined Claude + Gemini Workflow

```
1. Architecture & Planning:  Claude Code (Opus) -- better system design
2. Large Context Analysis:   Gemini CLI -- 1M token context window
3. Feature Development:      Claude Code -- reads codebase, precise edits
4. Documentation:            Either -- both good at docs
5. CI/CD Setup:              Claude Code -- can read/write GitHub Actions
6. Debugging:                Claude Code -- has tool access to run commands
7. Quick Prototyping:        Gemini CLI -- free, fast
8. Code Review:              Either -- both offer PR review capabilities
```

### Claude Code One-Shot Examples

```bash
claude "explain the architecture of this project"
claude "add offline support with service worker caching"
claude "convert this Express app to Next.js API routes"
claude "create a PWA manifest and install prompt"
claude "set up GitHub Actions to build Tauri for all platforms"
claude "add Stripe billing integration with 3 pricing tiers"
claude --model opus "plan how to restructure for Vercel deployment"
```

### Gemini CLI One-Shot Examples

```bash
gemini "scaffold a Next.js PWA with offline support"
gemini "create a Tauri desktop app with React and auto-updates"
gemini "set up GitHub Actions for cross-platform Flutter builds"
gemini "analyze this 500-file codebase and identify performance bottlenecks"
```

---

## 13. Developer Setup Checklist

### For All Development
- [ ] Node.js 20+ LTS
- [ ] Git + GitHub account
- [ ] VS Code or Cursor IDE
- [ ] Claude Code CLI: `npm i -g @anthropic-ai/claude-code`
- [ ] Gemini CLI: `npm i -g @google/gemini-cli`
- [ ] GitHub CLI: `gh`

### For Android Apps
- [ ] Android Studio (latest) with SDK
- [ ] Java 17+ (for Gradle)
- [ ] Google Play Developer account ($25 one-time)
- [ ] For React Native: `npm i -g eas-cli` (Expo)
- [ ] For Flutter: Flutter SDK + Dart

### For PWAs
- [ ] HTTPS domain (required for service workers)
- [ ] Vercel or Cloudflare account (free tier)
- [ ] manifest.json + service worker setup
- [ ] Icons: 192x192 and 512x512 minimum

### For Desktop Apps
- [ ] For Tauri: Rust toolchain (`rustup`)
- [ ] For Electron: Just Node.js
- [ ] For Flutter: Flutter SDK
- [ ] Code signing certificate (optional but recommended):
  - Windows: Self-signed or DigiCert (~$200/yr)
  - macOS: Apple Developer ($99/yr)
- [ ] GitHub repo (for Releases-based distribution)

### For Deployment
- [ ] Railway account (for Express server)
- [ ] Vercel account (for frontend/Next.js)
- [ ] Cloudflare account (for SvelteKit/edge)
- [ ] PostgreSQL hosted (Railway, Supabase, or Neon)

---

## 14. FlashFusion Recommended Path

### Quickest to Ship (Minimal Changes)

1. Clean up repo (remove `attached_assets/`, `nul`, fix `.gitignore`)
2. Rotate credentials exposed in `.replit` file
3. Push to GitHub
4. Deploy backend to **Railway** (supports Express as-is)
5. Railway provides PostgreSQL -- just set `DATABASE_URL`
6. Cost: ~$5-25/month

### If You Want Vercel Eventually

1. Rewrite with **Next.js App Router** (API routes replace Express)
2. Use **Neon** or **Supabase** for PostgreSQL (serverless-compatible)
3. Replace WebSockets with polling or Server-Sent Events
4. Replace scheduler with **Vercel Cron Jobs**
5. Replace session auth with **Auth.js** (stateless)

### If You Want a Mobile App Too

1. Keep the Express API on Railway
2. Build a **React Native (Expo)** app that calls the same API
3. Or wrap the PWA version in a **TWA** for the Play Store (easiest)

### If You Want a Desktop App

1. Keep the Express API on Railway
2. Build a **Tauri 2.0** wrapper around your React frontend
3. Use `tauri-plugin-updater` for auto-updates via GitHub Releases
4. Bundle size: ~5-10 MB instead of 150+ MB with Electron

---

## 15. Sources

### Claude Code Ecosystem
- [Claude Code Changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Claude Agent SDK Python](https://github.com/anthropics/claude-agent-sdk-python)
- [Claude Agent SDK Migration Guide](https://platform.claude.com/docs/en/agent-sdk/migration-guide)
- [Apple Xcode + Claude Agent SDK](https://www.anthropic.com/news/apple-xcode-claude-agent-sdk)
- [ClaudeLog - Docs & Best Practices](https://claudelog.com/claude-code-changelog/)

### Gemini CLI Ecosystem
- [Gemini CLI npm](https://www.npmjs.com/package/@google/gemini-cli)
- [Gemini CLI GitHub](https://github.com/google-gemini/gemini-cli)
- [Gemini CLI Release Notes](https://geminicli.com/docs/changelogs/)
- [Gemini CLI Docs](https://geminicli.com/docs/)
- [Google Cloud Gemini CLI](https://docs.cloud.google.com/gemini/docs/codeassist/gemini-cli)

### MCP Ecosystem
- [MCP Roadmap](https://modelcontextprotocol.io/development/roadmap)
- [Official MCP Registry](https://registry.modelcontextprotocol.io/)
- [MCP Servers GitHub](https://github.com/modelcontextprotocol/servers)
- [MCP Registry Preview Blog](https://modelcontextprotocol.info/blog/mcp-registry-preview/)
- [Red Hat - Building AI Agents with MCP](https://developers.redhat.com/articles/2026/01/08/building-effective-ai-agents-mcp)

### Agent Frameworks
- [CrewAI vs LangGraph vs AutoGen (DataCamp)](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen)
- [Agent Framework Comparison 2026 (DEV.to)](https://dev.to/pockit_tools/langgraph-vs-crewai-vs-autogen-the-complete-multi-agent-ai-orchestration-guide-for-2026-2d63)
- [Top 10 AI Agent Frameworks 2026](https://o-mega.ai/articles/langgraph-vs-crewai-vs-autogen-top-10-agent-frameworks-2026)

### Mobile Development
- [Expo SDK 52 Features](https://medium.com/@mernstackdevbykevin/expo-sdk-52-all-new-apis-for-faster-mobile-development-d53f15a0bf57)
- [Flutter vs React Native 2026](https://www.geekboots.com/story/flutter-vs-react-native-which-one-should-you-choose-in-2026)
- [React Native New Architecture](https://docs.expo.dev/guides/new-architecture/)

### Desktop App Frameworks
- [Tauri vs Electron Comparison](https://www.raftlabs.com/blog/tauri-vs-electron-pros-cons/)
- [Web-to-Desktop Framework Comparison](https://github.com/Elanis/web-to-desktop-framework-comparison)
- [Electron Alternatives](https://www.astrolytics.io/blog/electron-alternatives)

### PWA Development
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Serwist for Next.js](https://javascript.plainenglish.io/building-a-progressive-web-app-pwa-in-next-js-with-serwist-next-pwa-successor-94e05cb418d7)
- [Vite PWA for SvelteKit](https://vite-pwa-org.netlify.app/frameworks/sveltekit)

### Deployment Platforms
- [Railway vs Render 2026](https://northflank.com/blog/railway-vs-render)
- [Render vs Vercel 2026](https://northflank.com/blog/render-vs-vercel)
- [Railway vs Fly.io](https://docs.railway.com/platform/compare-to-fly)
- [Deploying Full Stack Apps 2026](https://www.nucamp.co/blog/deploying-full-stack-apps-in-2026-vercel-netlify-railway-and-cloud-options)
- [PaaS Comparison Guide (Railway)](https://blog.railway.com/p/paas-comparison-guide)
