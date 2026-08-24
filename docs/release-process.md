# Release process

NASA Mission Control uses Semantic Versioning (`MAJOR.MINOR.PATCH`) from version 1.0.0 and keeps human-readable changes in `CHANGELOG.md`.

## Channels

| Channel           | Identifier                                          | Audience                                    | Promotion rule                                                                                   |
| ----------------- | --------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Preview           | Vercel URL for every non-production branch/PR       | Maintainers and reviewers                   | Preview smoke, CI, desktop/mobile review                                                         |
| Release candidate | `vMAJOR.MINOR.PATCH-rc.N` tag and prerelease record | Structured usability and final verification | Same tagged commit passes release workflow; no production alias change is implied                |
| Stable            | `vMAJOR.MINOR.PATCH` tag and GitHub release         | Public                                      | Tag points to the already-reviewed main commit; production deployment for that commit is healthy |

Vercel’s Git integration deploys branches and `main`. A GitHub release is a source/history record, not evidence that Vercel or every NASA upstream is available. Promote an already-tested preview artifact when manual promotion is needed; do not rebuild a different artifact. Rollback procedures remain in `operations.md`.

## Version policy

- **PATCH:** compatible fixes, content corrections, accessibility repairs, and operational hardening without a new product contract.
- **MINOR:** backward-compatible instruments, learning tracks, analysis, or public API fields.
- **MAJOR:** incompatible routes, storage/backup formats, public API contracts, or removal of supported behavior.
- Release candidates use `-rc.N`. Every workspace manifest, the lockfile, changelog heading, and tag must match exactly.

## Repeatable checklist

1. Triage the monthly review and select issues with evidence, owner, and acceptance criteria.
2. Update all workspace versions and `package-lock.json`; move shipped entries from Unreleased into a dated changelog section.
3. Run `npm run release:check` and every definition-of-done gate.
4. Push the reviewed commit and verify CI, preview smoke, critical journeys, accessibility, and production budgets.
5. Optionally tag an exact release candidate, conduct the structured session in `continuous-improvement.md`, and fix findings through a new version.
6. Create an annotated stable tag (`git tag -a vX.Y.Z -m "vX.Y.Z"`) on the approved commit and push that tag. The release workflow revalidates version, lockfile, changelog, tests, build, and budgets before publishing the GitHub release.
7. Confirm the production deployment commit, run `npm run smoke:production`, scan runtime errors, and update `public-status.md` if capabilities or limitations changed.
8. For a harmful release, follow the documented Vercel rollback and publish a corrective patch/changelog entry. Never move an existing public tag.

The workflow grants write access only to release contents on tag runs. Deployment credentials are not stored or required by the release workflow.
