# Live-data clarity and reliability experience — Phase 4

Reviewed: 2026-08-26
Owner: frontend and reliability maintainer

## Shared interpretation contract

Every normalized live-data surface now gives the retrieval timestamp in UTC, states that retrieval time may differ from observation or publication time, and provides a source-specific update expectation. Current responses retain the NASA API label. A fallback is instead labeled **STALE DATA**, uses a restrained amber treatment, explains that the current retrieval failed, and tells readers to treat the record as historical context rather than current conditions.

The interpretation panels use the same vocabulary throughout:

- **Observed** — an instrument observation or reported measurement.
- **Modeled** — an analysis or prediction produced from inputs and assumptions.
- **Calculated** — a transparent transformation performed by Mission Control, such as a count, comparison, or unit conversion.
- **Curated** — a selected or described archive record whose wording or metadata is editorial.

APOD is a dated curated selection, not a sky-condition feed. NeoWs combines observed orbit information with modeled diameter ranges and calculated close-approach predictions. DONKI can mix observations, analyst interpretations, and model outputs and is not an operational forecast. EPIC supplies observed imagery and telemetry with processed natural/enhanced color. NASA Media search returns curated archive metadata rather than a complete live record of NASA activity.

## Accessible comparisons

Each analysis graphic has a semantic table immediately beside it. Captions now identify the table as the chart or timeline equivalent; headers identify UTC, units, and evidence origin. Visual labels and accessible descriptions use the same population and measure: APOD media records, calculated asteroid approach counts, DONKI published-measurement counts, and EPIC frame chronology.

## Reliability decision

The retained production artifact contains one run with two successful observations per route. It records zero route failures, stale fallbacks, validation failures, or alerts. Cold-route p95 values range from 51 ms for NASA Media to 1.65 s for NeoWs, below the existing 5 s alert threshold. This sample proves the collector works but cannot support a representative baseline, so the 5% failure, 10% stale, 5 s latency, and 20-sample cache diagnostic thresholds remain unchanged.

The trend aggregator now recognizes the exact `x-data-status: stale-fallback` value even when `x-cache` does not independently report `STALE`. A regression test protects that production header contract. Thresholds must be reviewed after the first complete 30-day window, or earlier when repeated false positives or missed incidents provide evidence.

## Official assumptions reviewed

- [NASA Open APIs](https://api.nasa.gov/) documents APOD dated records and NeoWs asteroid search.
- [NASA CCMC DONKI](https://kauai.ccmc.gsfc.nasa.gov/DONKI/) identifies its mixed observation, analysis, and model information as preliminary experimental research rather than the official U.S. forecast.
- [NASA EPIC API](https://epic.gsfc.nasa.gov/about/api) documents most-recent-available and dated imagery plus image metadata.
- [NASA EPIC imagery guide](https://epic.gsfc.nasa.gov/api) explains adjusted natural color and processed enhanced color.
- [NASA Image and Video Library API](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf) defines archive search and asset metadata.

No endpoint, credential requirement, or normalized server contract changed in this phase.

## Verification

Component tests cover UTC formatting, source expectations, evidence guidance, and stale announcements. Reliability tests cover the exact stale header value. Existing accessibility and browser suites protect status semantics, stale/degraded screenshots, and matching live-data journeys. Release preflight enforces schemas, resilience, content health, build, asset budgets, and offline exclusions.
