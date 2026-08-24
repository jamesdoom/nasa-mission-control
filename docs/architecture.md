# Production architecture

```mermaid
flowchart LR
  Visitor[Browser] -->|HTTPS routes| Edge[Vercel edge and CDN]
  Edge --> SPA[React and Vite shell]
  Edge --> API[Express API boundary]
  SPA --> Local[(Local Flight Log)]
  SPA -->|Normalized /api models| API
  API --> Cache[Bounded memory cache]
  Cache --> NASA[Official NASA services]
  API --> Logs[Structured runtime logs]
  SPA -->|Sanitized runtime failures| API
  SPA --> Vitals[Speed Insights]
  Actions[GitHub Actions] -->|30-minute route checks| Edge
  Actions -->|Daily browser audits| SPA
  Preview[Preview deployment] -->|Deployment-status gate| Actions
```

Trust changes are explicit: NASA response shapes and credentials remain behind
the server; normalized shared contracts cross into the client; private Flight
Log content stays local; and operations receive only bounded technical signals.
The edge can cache successful public NASA responses, while errors and health
responses are `no-store`. The service worker excludes every `/api` request.
