# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Somain is a monitoring dashboard ("Monitor Center") for infrastructure and business flow visualization with an AI-powered diagnostic agent panel. The frontend lives entirely in the `ui/` directory.

## Commands

All commands run from the `ui/` directory. The runtime is **Deno** (not Node.js).

```bash
cd ui
deno task dev      # Start dev server (Vite)
deno task build    # Production build
deno task preview  # Preview production build
```

There are no tests, linting, or formatting configurations.

## Tech Stack

- **Runtime**: Deno with `--node-modules-dir` for npm compatibility
- **Framework**: Vue 3.5 with Composition API (`<script setup lang="ts">`)
- **Build**: Vite 5 with `@vitejs/plugin-vue`
- **i18n**: vue-i18n 9 (non-legacy mode, English + Chinese)
- **State**: Composables with Vue refs (no Vuex/Pinia)
- **Data**: All data is mocked locally — no real API backend

## Architecture

### Layout (App.vue)

Three-panel fixed layout:
- **Sidebar** (left, 200px) — project list with status indicators
- **Main content** (center) — TopBar + Dashboard
- **AgentPanel** (right, 350px) — AI assistant chat interface

### Directory Structure (ui/src/)

```
components/     # All UI components (Sidebar, TopBar, MonitorCard, AgentPanel, etc.)
views/          # Dashboard.vue — main layout and state orchestration
services/       # mockData.ts (interfaces + seed data), mockService.ts (simulated API)
composables/    # useProject.ts (active project), useAgentContext.ts (agent messaging)
locales/        # en.json, zh.json — all user-facing text uses i18n keys
assets/         # base.css — CSS custom properties for theming
```

### Key Patterns

- **All components use `<script setup lang="ts">`** — no Options API anywhere
- **i18n keys for all user-facing text** — labels use `nameKey`/`labelKey` referencing keys in `locales/*.json`
- **Path alias**: `@` maps to `ui/src/`
- **Mock service** (`useMockService()`) provides data fetching, project/monitor CRUD, and a simulation mode (3s interval status changes)
- **Composable state**: `useProject()` tracks active project; `useAgentContext()` manages chat messages and monitor context
- **Monitor types**: `api`, `mq`, `search`, `order`, `db`, `cache` — each with metrics, history sparkline, events, agent diagnosis, and optional flow steps

### Data Model

Core interfaces in `services/mockData.ts`:
- `Project` — id, nameKey, status (`ok`/`error`/`warning`)
- `Monitor` — id, projectId, nameKey, status (`ok`/`error`/`slow`), type, metrics, history, events, agent, flowSteps
- `MonitorAgent` — diagnostic steps and root cause with confidence

### CSS Theming

Global CSS variables defined in `assets/base.css`:
- Colors: `--primary` (#1890ff), `--success` (#52c41a), `--warning` (#faad14), `--error` (#ff4d4f)
- Layout: `--sidebar-width` (200px)
- Use these variables rather than hardcoding colors

## Gitignore Notes

The `.gitignore` includes entries for Go (`server/`), Solidity (`contracts/`), and Node — suggesting planned backend/contract directories that don't exist yet.
