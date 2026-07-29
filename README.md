# NASA Mission Control

An original, responsive command-center experience for exploring NASA imagery and space science. Milestone one delivers a polished dashboard, the Astronomy Picture of the Day archive, and a browser-local flight log through a secure Express API boundary.

> Portfolio project; not affiliated with or endorsed by NASA.

## Current features

- Responsive application shell with accessible desktop/mobile navigation
- Mission Control dashboard and live UTC telemetry styling
- APOD image and embedded-video support with date-based shareable URLs
- Server-side NASA key, response normalization, timeout, validation, stable errors, and memory caching
- Local APOD favorites with attribution when supplied by NASA
- Loading, empty, error, and retry experiences; reduced-motion support
- Versioned favorite persistence with legacy migration and malformed-data recovery
- Security headers, structured request logs, bounded caching, and graceful shutdown
- Automated accessibility checks, Chromium smoke tests, and GitHub Actions CI

## Planned modules

Asteroid Watch (NeoWs), Earth Observatory (EPIC/Earthdata GIBS), Space Weather (DONKI), NASA Media Library, curated Mission Archive, expanded Flight Log, and source-checked Space Trivia. The legacy NASA Earth and Mars Rover APIs are archived and will not be used.

## Stack

React, Vite, strict TypeScript, React Router, TanStack Query, Node.js, Express, Helmet, Zod, CSS, npm workspaces, Vitest, React Testing Library, axe-core, Playwright, ESLint, and Prettier.

## Local setup

Requirements: Node.js 20.19+ and npm 10+.

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env`. Open `http://localhost:5173`; the Express API runs on `http://localhost:3001` and Vite proxies `/api` during development.

## Environment variables

| Name                      | Required | Purpose                                                               |
| ------------------------- | -------- | --------------------------------------------------------------------- |
| `NODE_ENV`                | No       | Runtime mode; defaults to `development`                               |
| `NASA_API_KEY`            | Yes      | Personal api.nasa.gov key, or `DEMO_KEY` for limited local evaluation |
| `PORT`                    | No       | Express port; defaults to `3001`                                      |
| `CLIENT_ORIGIN`           | No       | Allowed development origin; defaults to `http://localhost:5173`       |
| `NASA_REQUEST_TIMEOUT_MS` | No       | Upstream timeout; defaults to `8000`                                  |
| `APOD_CACHE_TTL_MS`       | No       | In-memory cache lifetime; defaults to `300000`                        |
| `APOD_CACHE_MAX_ENTRIES`  | No       | Maximum cached APOD records; defaults to `100`                        |

`DEMO_KEY` is limited by NASA to 30 requests per hour and 50 per day per IP. Never place NASA keys in `VITE_*` variables or commit `.env`.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
npm run format:check
```

The first Playwright run may require `npx playwright install chromium`.

## Production run

Build all workspaces, set `NODE_ENV=production`, and start Express. The server serves both the compiled SPA and `/api` routes:

```powershell
npm run build
$env:NODE_ENV="production"
npm start
```

Open `http://localhost:3001`. Deployments must provide `NASA_API_KEY`; the client build never receives it. Any Node.js host that runs the build and start commands and preserves environment variables can use this production path.

## Architecture

The browser calls `GET /api/apod?date=YYYY-MM-DD`. Express validates the query, calls NASA with the private key, validates the important upstream fields, and maps them into this deliberately small model:

```ts
type Apod = {
  date: string;
  title: string;
  explanation: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  hdUrl: string | null;
  thumbnailUrl: string | null;
  copyright: string | null;
};
```

Errors use `{ error: { code, message, requestId } }`; server details and credentials are never returned. Shared internal contracts live in `packages/shared`, while NASA-specific schemas remain in `apps/server`.

## Testing

`npm test` covers query validation, bounded caching, security headers, NASA response transformation, malformed upstream responses, media rendering, automated accessibility checks, the UTC clock, and versioned local favorites. `npm run test:e2e` verifies dashboard loading, archive URL state, mobile navigation, and the complete favorite flow in Chromium using deterministic mocked APOD data.

[GitHub Actions](.github/workflows/ci.yml) runs formatting, strict types, lint, all Vitest suites, the production build, and Chromium smoke tests for pushes to `main` and pull requests.

## NASA APIs and attribution

Milestone one uses [NASA Open APIs APOD](https://api.nasa.gov/). NASA’s official APOD service repository notes that the public hosted instance can experience downtime, so the application treats it as a fallible upstream. NASA-provided copyright attribution is displayed when present. The [NASA Image and Video Library API](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf), NeoWs, DONKI, EPIC, and Earthdata GIBS are candidates for later milestones after integration-specific review.

## Roadmap

1. **Complete:** foundation, dashboard, APOD, local flight log, and Phase 1.1 hardening.
2. Asteroid Watch with responsible NeoWs visualizations and plain-language context.
3. NASA Image and Video Library search and detail pages.
4. DONKI Space Weather Center.
5. EPIC/Earthdata imagery, curated missions, and trivia.

## Screenshots

The captures below use deterministic mocked APOD content so they can be regenerated without consuming NASA API quota.

![Mission Control dashboard](docs/screenshots/dashboard.png)

![Mission Control mobile navigation](docs/screenshots/mobile-navigation.png)

## License

_License selection pending. Add a project license before public distribution._
