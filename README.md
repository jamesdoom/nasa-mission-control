# NASA Mission Control

An original, responsive command-center experience for exploring NASA imagery and space science. The current release combines APOD, a data-rich Asteroid Watch, NASA Image and Video Library search, and a browser-local Flight Log behind a secure Express API boundary.

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
- Asteroid Watch date-range scans, sorting, telemetry, and shareable encounter pages
- Responsible NASA/JPL potentially hazardous classifications with explicit impact context
- Saved asteroid encounters alongside APOD discoveries in the Flight Log
- NASA Image and Video Library full-text search, media filters, pagination, and asset detail pages
- Responsive image, video, and audio presentation with original-asset links
- Optimized responsive Milky Way atmosphere with deliberate contrast overlays
- DONKI Space Weather Center for solar flares, CMEs, and geomagnetic storm observations
- Plain-language measurements, UTC timestamps, research disclaimers, and source links

## Planned modules

Earth Observatory (EPIC/Earthdata GIBS), curated Mission Archive, expanded Flight Log, and source-checked Space Trivia. The legacy NASA Earth and Mars Rover APIs are archived and will not be used.

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
| `NASA_REQUEST_TIMEOUT_MS` | No       | Upstream timeout; defaults to `30000`                                 |
| `NASA_CACHE_TTL_MS`       | No       | In-memory NASA response cache lifetime; defaults to `300000`          |
| `NASA_CACHE_MAX_ENTRIES`  | No       | Maximum records per NASA response cache; defaults to `100`            |

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

The browser calls internal endpoints such as `GET /api/apod?date=YYYY-MM-DD`, `GET /api/asteroids?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`, `GET /api/media/search?q=apollo&mediaType=image&page=1`, and `GET /api/space-weather?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&category=all`. Express validates each query, calls NASA services, validates important upstream fields, and maps them into deliberately small internal models:

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

The asteroid contract contains only identity, JPL source URL, NASA classification flags, estimated diameter bounds, and the selected Earth approach’s UTC time, relative velocity, and miss distance. Dynamic NeoWs date buckets and numeric strings never reach the UI.

Errors use `{ error: { code, message, requestId } }`; server details and credentials are never returned. Shared internal contracts live in `packages/shared`, while NASA-specific schemas remain in `apps/server`.

## Testing

`npm test` covers query and date-range validation, bounded caching, security headers, APOD, NeoWs, Collection+JSON, and DONKI response transformation, malformed upstream responses, responsible scientific wording, media rendering, automated accessibility checks, the UTC clock, and local favorites. `npm run test:e2e` verifies dashboard loading, URL-backed filters, responsive navigation, APOD favorites, asteroid workflows, NASA media navigation, and Space Weather filtering in Chromium using deterministic mocked data.

[GitHub Actions](.github/workflows/ci.yml) runs formatting, strict types, lint, all Vitest suites, the production build, and Chromium smoke tests for pushes to `main` and pull requests.

## NASA APIs and attribution

The application uses [NASA Open APIs](https://api.nasa.gov/) for APOD and NeoWs. NASA’s official APOD service repository notes that the public hosted instance can experience downtime, so every NASA integration is treated as a fallible upstream. NASA-provided copyright attribution is displayed when present.

Asteroid measurements come from NASA/JPL through NeoWs. NASA/JPL defines a potentially hazardous asteroid using orbital proximity and absolute magnitude criteria; the classification does not mean an Earth impact is predicted. See the official [CNEOS PHA definition](https://cneos.jpl.nasa.gov/glossary/PHA.html) and [NEO FAQ](https://cneos.jpl.nasa.gov/faq/).

The active [NASA Image and Video Library API](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf) provides search and asset manifests without an API key. Its published PDF is release 1.22.0 from January 2023, and live responses sometimes label preview images `alternate` instead of the documented `preview`; server normalization accepts both. Results can identify third-party copyright holders or people with publicity rights, so detail pages retain source metadata and link to NASA rather than making blanket reuse claims. See NASA’s [Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).

The global Milky Way backdrop is the Pixabay image [“Astronomy, Bright, Constellation”](https://pixabay.com/photos/astronomy-bright-constellation-dark-1867616/) by Pexels, supplied for this project and stored as optimized responsive WebP variants. EPIC and Earthdata GIBS remain candidates for later milestones after integration-specific review.

Space weather observations come from NASA’s active DONKI FLR, CME, and GST endpoints. NASA/CCMC describes DONKI as preliminary experimental research information supplied as a community service, not the official U.S. operational forecast. The application links to [NOAA’s Space Weather Prediction Center](https://www.swpc.noaa.gov/) for official forecasts and to each DONKI source record for context.

## Roadmap

1. **Complete:** foundation, dashboard, APOD, local flight log, and Phase 1.1 hardening.
2. **Complete:** Asteroid Watch with responsible NeoWs telemetry, encounter pages, and saved objects.
3. **Complete:** NASA Image and Video Library search, filters, pagination, detail pages, and cinematic visual foundation.
4. **Complete:** DONKI Space Weather Center with observed event chronology, filters, measurements, and research context.
5. EPIC/Earthdata imagery, curated missions, and trivia.

## Screenshots

The captures below use deterministic mocked NASA content so they can be regenerated without consuming API quota.

![Mission Control dashboard](docs/screenshots/dashboard.png)

![Mission Control mobile navigation](docs/screenshots/mobile-navigation.png)

![Asteroid Watch encounter scan](docs/screenshots/asteroid-watch.png)

![NASA Media Library search](docs/screenshots/media-library.png)

![DONKI Space Weather Center](docs/screenshots/space-weather.png)

## License

_License selection pending. Add a project license before public distribution._
