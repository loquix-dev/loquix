# Contributing to Loquix

Thanks for contributing. This repository is a `pnpm` workspace with three main areas:

- `packages/core` - the Lit-based Web Components library
- `packages/react` - React wrappers for `@loquix/core`
- `docs` - Storybook stories and documentation

## Prerequisites

- Node.js 20 or newer
- `pnpm` 9 or newer
- Playwright browsers for the core test suite

The repository is pinned to `pnpm@10.30.3` through `packageManager` in the root `package.json`.

## Getting Started

```bash
pnpm install
pnpm --filter @loquix/core exec playwright install chromium webkit
```

Common commands from the repository root:

```bash
pnpm storybook        # run Storybook locally
pnpm dev              # run the core package in dev mode
pnpm lint             # run ESLint
pnpm format:check     # verify Prettier formatting
pnpm test             # run the core test suite
pnpm test:coverage    # run tests with coverage
pnpm build            # build @loquix/core and @loquix/react
pnpm build:cdn        # build the CDN bundle
pnpm build:storybook  # build the docs site
```

## Development Workflow

1. Create a branch from `main`.
2. Make the smallest change that solves the problem.
3. Add or update tests and Storybook stories when behavior changes.
4. Run the relevant local checks before opening a pull request.

For most code changes, this is the minimum expected local verification:

```bash
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

If your change affects Storybook, docs, or visual behavior, also run:

```bash
pnpm storybook
```

## Project Conventions

### Core components

In `packages/core`, component files generally follow this layout:

- `loquix-*.ts` - component implementation
- `*.styles.ts` - styles
- `*.test.ts` - tests
- `define-*.ts` - safe custom element registration with a `customElements.get()` guard

Please keep existing naming and folder conventions unless there is a clear reason to change them.

### Events and styling

- Custom events use the `loquix-` prefix
- Events should bubble and be composed when they are part of the public API
- CSS custom properties use the `--loquix-` prefix

### Tests

The `@loquix/core` test suite runs in Chromium and WebKit via Web Test Runner and Playwright. Changes to interactive behavior, accessibility, rendering, or events should include test coverage.

## Changesets and Releases

This repository uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

- Add a changeset for user-facing changes to published packages
- Skip a changeset for docs-only, CI-only, or internal-only changes
- `@loquix/core` and `@loquix/react` are linked, so version bumps move together
- The `docs` package is ignored by Changesets

To create a changeset:

```bash
pnpm changeset
```

## Pull Requests

When opening a pull request:

- describe the user-visible change and the reason for it
- call out API, accessibility, or styling impacts
- include screenshots or Storybook notes for visual changes
- mention any follow-up work that is intentionally left out

Small, focused pull requests are much easier to review than large mixed changes.
