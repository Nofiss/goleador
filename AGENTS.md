# AGENTS.md

This guide helps agentic coders work effectively in this repo.
Follow repository rules and existing conventions; do not invent new ones.

## Repository Layout

- Backend: `src/backend` (.NET 10, Clean Architecture, MediatR, EF Core)
- Frontend: `src/frontend` (React + Vite + TypeScript + Tailwind + Biome)
- Infra: `infrastructure` (Docker compose and env examples)
- Docs: `docs`

## Build, Lint, Test

### Backend (.NET)

- Restore: `dotnet restore` (run in `src/backend`)
- Build (Release): `dotnet build --no-restore --configuration Release`
- Test all: `dotnet test --no-build --configuration Release --verbosity normal`
- Single test by name:
  - `dotnet test Goleador.Tests/Goleador.Tests.csproj --filter "FullyQualifiedName~SomeNamespace.SomeTests"`
  - `dotnet test Goleador.Tests/Goleador.Tests.csproj --filter "Name~CreatePlayer"`
- Single test class:
  - `dotnet test Goleador.Tests/Goleador.Tests.csproj --filter "FullyQualifiedName~CreatePlayerCommandHandlerTests"`
- Single test method:
  - `dotnet test Goleador.Tests/Goleador.Tests.csproj --filter "FullyQualifiedName~CreatePlayerCommandHandlerTests.Handle"`

### Frontend (Vite + TypeScript)

- Install deps (preferred by CI): `pnpm install --frozen-lockfile` (run in `src/frontend`)
- Dev server: `pnpm run dev` or `npm run dev`
- Build: `pnpm run build` or `npm run build`
- Type check: `pnpm tsc --noEmit`
- Lint/format (Biome):
  - Check: `pnpm run biome:check` or `npm run biome:check`
  - Lint: `pnpm run biome:lint` or `npm run biome:lint`
  - Format: `pnpm run biome:format` or `npm run biome:format`
  - Fix: `pnpm run biome:fix` or `npm run biome:fix`
- Tests: no frontend test runner configured yet.

### Docker

- Backend container build: `docker build -f src/backend/Dockerfile ./src/backend`
- Frontend container build: `docker build -f src/frontend/Dockerfile ./src/frontend`

## Environment and Config

- Frontend env examples: `src/frontend/.env.example` and `src/frontend/.env.development`
- Infra env example: `infrastructure/.env.example`
- Do not commit secrets or local appsettings overrides.

## Code Style and Conventions

### C# (.NET backend)

Source of truth: `src/backend/.editorconfig` and
`src/backend/Goleador.Application/.editorconfig`.

General formatting

- Indent: 4 spaces; LF line endings; trim trailing whitespace.
- Allman braces (open brace on new line).
- File-scoped namespaces preferred.
- Always use braces for single-line control blocks.
- When wrapping operators, place operator at start of line.

Using/imports

- Sort `System.*` usings first.
- Do not separate using groups with blank lines.
- Prefer implicit usings (enabled in csproj).

Types and language style

- Prefer `var` when the type is apparent.
- Prefer modern C# constructs (null propagation, coalesce, switch expressions).
- Expression-bodied members are OK on single line.
- Prefer auto-properties when possible.

Naming conventions

- Interfaces start with `I` (PascalCase).
- Async methods end with `Async` (except controller actions).
- Private fields use `_camelCase`.
- Modifier order: `public private protected internal static extern new virtual
  abstract sealed readonly unsafe volatile async`.

Architecture patterns

- Controllers are thin; use MediatR to dispatch commands/queries.
- Application layer uses CQRS: `Command`, `Query`, `Handler`, `Validator`.
- Domain entities live in `Goleador.Domain`, no direct API dependencies.

Error handling

- Prefer throwing application exceptions: `ValidationException`,
  `NotFoundException`, `ForbiddenAccessException`, `ConcurrencyException`.
- Global handling is in `Goleador.Api.Infrastructure.GlobalExceptionHandler`.
- Validation uses FluentValidation via `ValidationBehavior` pipeline.
- Do not return framework exceptions or stack traces in API responses.

Testing

- xUnit in `Goleador.Tests`.
- Name tests descriptively; keep tests in `Goleador.Tests.Application.*`.
- Use `FluentAssertions` for assertions when possible.

### TypeScript/React (frontend)

Source of truth: `src/frontend/biome.json`, `tsconfig*.json`.

Formatting (Biome)

- Indent: tabs; width: 2.
- Line width: 100.
- Semicolons: always.
- Quotes: double for JS/TS and JSX.
- Trailing commas: always.

Imports and module conventions

- Use path alias `@/` for `src/` imports.
- Organize imports (Biome assist organizeImports).
- Default exports are allowed (rule is off), but named exports are preferred.

Types and safety

- TypeScript strict mode is enabled.
- Avoid `any` (Biome warns on explicit any).
- Prefer explicit types at public boundaries (API clients, hooks, components
  that form reusable units).

React patterns

- Use functional components and hooks.
- Keep page components under `src/pages` and feature components in
  `src/features`.
- Use shared UI components in `src/components`.

API and state

- Axios instance with auth/refresh lives in `src/api/axios.ts`.
- API modules under `src/api`; keep endpoints grouped by domain.
- Handle 401 refresh token flow through the shared axios instance.

Error handling

- Global error UI uses `GlobalErrorFallback` in
  `src/frontend/src/components/errors/GlobalErrorFallback.tsx`.
- For API errors, surface user-friendly messages; do not leak server details.

### Formatting for other files

- JSON/YAML/Markdown: 2-space indentation (editorconfig).

## CI Expectations

- Backend CI runs: restore, build (Release), test, publish.
- Frontend CI runs: `pnpm install --frozen-lockfile`, `pnpm tsc --noEmit`,
  `pnpm run build`.
- Match local commands to CI to avoid surprises.

## Cursor/Copilot Rules

- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md`
  were found in this repository at time of writing.

## Notes for Agents

- Prefer repo tooling over ad-hoc scripts.
- Keep changes scoped; avoid unrelated refactors.
- Respect existing architecture boundaries.
- Do not commit secrets or environment-specific files.
