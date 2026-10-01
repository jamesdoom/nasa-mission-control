# APOD migration — October 1, 2026

The deployed legacy `https://api.nasa.gov/planetary/apod` service returned the
title `NASA Science` and a NASA logo for October 1, despite the official page
showing **Harvest Moon with Erupting Mount Etna**. The September 28 beige
image was a real APOD; the subsequent incorrect response is a separate issue.

## Verified source and contract

- [NASA's official service implementation](https://github.com/nasa/apod-api/blob/master/application.py)
  uses `https://science.nasa.gov/wp-json/wp/v2/apod-basic/YYMMDD`.
- [NASA's migration notice](https://github.com/nasa/apod-api#readme) describes
  the WordPress migration and a December 1, 2026 archive/redirect plan.
- The new endpoint is public and was verified without credentials. NASA keys
  remain server-only and are still needed for other integrations.
- `url` is an article permalink. `hdurl` is the image for image records and
  a poster for video records. `basic_html` contains the video/source or iframe
  URL, including protocol-relative YouTube URLs in older entries.
- HTML explanations, titles, and credits are parsed as text, never rendered
  as upstream HTML. Only HTTP(S) media URLs are accepted; missing media or
  a date mismatch produces the existing upstream error response.

Existing request deadlines, per-host circuit breakers, response validation,
bounded cache, and labeled stale fallback remain in place. This public NASA
service can still have outages, missing archive records, or publication delays.
The production monitor retains its fixed archive date to avoid new alarms
caused solely by today's publication timing. It now rejects NASA branding and
article URLs masquerading as media. Failure emails are not disabled, and this
change does not establish the cause of every earlier workflow failure.

## Validation

- Type checking, ESLint, production build, 190 unit/component/accessibility
  tests, and all 48 Playwright smoke tests passed.
- Live requests through the built Express app verified October 1, 2026 and
  January 1, 2024 images, August 19, 2026 MP4 video, and January 19, 2025 YouTube
  video, with correct titles, media URLs, and plain-text explanations.
- A browser check of the built homepage displayed the Moon image successfully.
  Browser smoke coverage includes responsive layouts and keyboard operation.
- Windows sandbox restrictions prevented esbuild from reading parent directories;
  the affected build and tests passed when rerun outside that sandbox.
