# Loquix — Project Conventions

## What is this?

Open-source Web Components library for AI/LLM chat interfaces. Built with Lit.

## Tech Stack

- **Web Components** via **Lit** ^3.x (decorators, Shadow DOM, reactive properties)
- **TypeScript** ^5.x, strict mode
- **pnpm** workspaces monorepo
- **Vite** ^6.x for builds (library mode, multi-entry)
- **ESLint** flat config + **Prettier**
- **@floating-ui/dom** for popover positioning

## Naming Conventions

- Tag names: `loquix-` prefix (e.g. `<loquix-chat-container>`)
- CSS vars: `--loquix-` prefix
- Events: `loquix-` prefix, `bubbles: true`, `composed: true`
- TS props: camelCase (e.g. `privateMode`)
- HTML attrs: kebab-case (e.g. `private-mode`)
- Use `@property({ attribute: 'kebab-name' })` for multi-word props

## Component Pattern

- Each component: `loquix-*.ts` (class, no auto-define) + `.styles.ts` + `.test.ts`
- Registration: `define-*.ts` files with `customElements.get()` guard
- Exports: `./define/*` (side-effect), `./classes/*` (class-only)

## File Locations

- Components: `packages/core/src/components/core/`
- Controllers: `packages/core/src/controllers/`
- Types: `packages/core/src/types/`
- Events: `packages/core/src/events/`
- Tokens: `packages/core/src/tokens/`
- Stories: `docs/src/stories/`

## Commands

- `pnpm dev` — dev server
- `pnpm build` — build library
- `pnpm test` — run tests (Chromium + WebKit)
- `pnpm test:coverage` — tests with coverage report
- `pnpm lint` — ESLint
- `pnpm format:check` — Prettier check
- `pnpm storybook` — Storybook
- `pnpm build:cdn` — CDN IIFE bundle
