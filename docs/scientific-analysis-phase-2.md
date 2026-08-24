# Deeper scientific analysis — Phase 2

## Reproducible analysis surfaces

- APOD retrieves the selected UTC date plus the preceding six dates through the existing normalized endpoint. The chart counts NASA media-type labels; its table lists every contributing record.
- Asteroid Watch groups normalized approaches by UTC approach date and calculates daily counts, potentially hazardous classifications, and minimum miss distance. Date range and metric remain in the URL.
- Space Weather allows two or three DONKI records to be selected in the URL. It aligns timestamps, locations, types, and published measurements without converting unlike physical quantities.
- Earth Observatory presents the EPIC sequence as a chronological timeline and table of source timestamps and centroid coordinates.
- Mission comparison defines common fields and exports the selected curated records as UTF-8 CSV with source URLs.

## Evidence boundaries

Observed values are measurements or timestamps reported by the normalized NASA record. Modeled values are marked for CME analysis outputs. Calculated values are transparent counts, minima, sorting, or chronology derived from normalized values. Curated values are reviewed Mission Control archive fields and APOD editorial metadata. No chart should be interpreted as a forecast.

## Integrity and accessibility

NASA payloads continue to pass server-side Zod schemas before reaching these tools. Unit tests protect aggregation bounds and source measurement preservation. Each graphical summary has an adjacent semantic table and text alternative, tables scroll without page overflow, and controls use native keyboard-operable elements.

Official assumptions were rechecked against NASA's APOD archive documentation, NeoWs seven-day feed constraint, DONKI research web services, and EPIC date/collection API on 2026-08-24.
