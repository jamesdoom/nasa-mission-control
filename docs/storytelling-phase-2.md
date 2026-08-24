# Scientific storytelling phase 2

Phase completed: August 2026

## Editorial model

Scientific stories are typed, repository-maintained narratives. They connect
existing Mission Control routes but do not copy upstream NASA response shapes,
invent live mission state, or imply that chapter order was authored by NASA.
Every collection provides:

- one bounded scientific question and a plain-language “why it matters” frame;
- four chapters labeled live, latest available, curated, or calculated;
- a concise takeaway that carries context into the next chapter;
- four dated orientation milestones;
- an explicit review date and links to current official NASA sources.

The initial collections cover ancient Mars habitability, the connected
Sun–Earth system, and complementary cosmic observatories. Their destinations
reuse normalized live APIs, reviewed Mission Archive records, the NASA media
boundary, and existing comparison tools.

## Source review

Sources were reviewed on 2026-08-24:

| Collection           | Official NASA basis                                                               | Claims deliberately limited                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Mars habitability    | Mars Exploration science goals, Curiosity science, and Perseverance mission pages | Habitability does not demonstrate that life existed; imagery alone does not establish scientific conclusions.               |
| Sun–Earth connection | Parker Solar Probe, Solar Terrestrial Probes, and DONKI                           | Flare, CME, and storm records describe different phenomena; chronology is not presented as proof of causation.              |
| Cosmic observatories | Hubble, Webb, and Webb early-universe science pages                               | Different wavelength coverage and locations produce complementary capabilities; distance is not treated as telescope power. |

## Integrity and maintenance

`storyCollections.test.ts` requires unique identifiers, four chapters, four
milestones, internal application routes, more than one evidence kind per story,
and official `nasa.gov` sources. Page tests cover both the complete narrative
and unknown-story recovery. Automated axe and Playwright checks cover semantic
structure, source links, and navigation into the first evidence chapter.

Review every collection at least annually and sooner when a linked active
mission record changes. A successful source-link check does not verify the
scientific summary; the reviewer must read the official page and update
`verifiedAt` only after confirming the bounded claims.
