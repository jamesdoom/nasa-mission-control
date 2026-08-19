# NASA Mission Control contributor guide

## Layout

- `apps/client`: React/Vite interface. It consumes only internal `/api` models.
- `apps/server`: Express API boundary and NASA integrations.
- `packages/shared`: stable API contracts shared by client and server.

## Architecture and conventions

- TypeScript strict mode is mandatory. Avoid `any`; validate untrusted values with Zod.
- Keep NASA credentials and upstream response shapes on the server. Normalize external data before returning it.
- External calls require a timeout, useful error mapping, response validation, and appropriate caching.
- Keep meaningful filter state in URLs and user-only preferences in local storage until account sync exists.
- Prefer focused components/functions, semantic HTML, keyboard operation, good contrast, and reduced-motion support.
- Add comments only for non-obvious reasoning. Format with Prettier and lint with ESLint.

## Commands

- `npm install`: install all workspaces.
- `npm run dev`: run client and server.
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`: quality gates.
- `npm run test:e2e`: run Playwright smoke tests against a local Vite server.
- `npm run performance:budget`: verify the built client stays within documented compressed asset budgets.
- `npm run smoke:production`: run read-only public health and SPA rewrite checks against the deployed site.
- `npm start`: serve the built client and API from the production Express process.
- `npm run format`: format source and documentation.

## Environment

Copy `.env.example` to `.env`. Never commit `.env`, keys, tokens, or credentials. `NASA_API_KEY=DEMO_KEY` is permitted only as a clearly labeled development option; use a personal key for sustained use.

## Definition of done

Strict types, lint, unit/component/accessibility tests, end-to-end smoke tests, and production builds pass; expected loading/error/empty states exist; important responsive layouts and keyboard flows are checked; no secrets enter client code or build output; docs match actual commands; and the final diff is reviewed for bugs, accessibility, and unnecessary complexity.

After a phase satisfies the definition of done, update the README roadmap, create a focused Git commit for that phase, and push it to the configured remote. Never push an incomplete or failing phase.

Verify every external API assumption against current official NASA documentation before implementing or changing an integration. Record retired endpoints, access requirements, and reliability limitations.
