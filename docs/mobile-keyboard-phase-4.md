# Phase 4: Mobile and keyboard polish

Completed 2026-09-15. No new features or NASA integration changes.

Mobile navigation scrolls within the available viewport below the sticky header, with safe-area padding. Its links retain at least 44px target height, and focus outlines sit inside the scroll container. Escape closes Explore and restores focus to its trigger; a second Escape closes mobile navigation and restores focus to the menu button. Command search retains its own Escape handling.

Header search, menu, icon, and update controls have minimum 44px targets. Main-content controls have scroll margins to help keep keyboard-focused elements clear of the sticky header. Mobile APOD images preserve their full framing within a bounded height, and embedded video frames use a widescreen ratio.

The persistent offline/update notice now sits in document flow below the footer instead of covering reading content. Its labels are larger, and the update action remains available there. This trades persistent onscreen prominence for an unobstructed reading area.

## Validation

Types, lint, unit/component/accessibility tests, production build, and compressed asset budgets passed. Browser smoke suite: 42 passed, one production-only test skipped. The added browser test checks a 390 x 640 menu viewport and both Escape focus transitions. Existing responsive, forced-color, reduced-motion, keyboard, and recovery tests passed.

Built-app checks at 390px and 1440px found no runtime errors or horizontal overflow. Visual inspection verified the full mobile image, scrollable menu, and status notice below the footer. These are maintainer checks, not participant usability research or testing on physical mobile devices.

- [Mobile APOD framing](screenshots/mobile-keyboard/apod-390.png)
- [Desktop APOD](screenshots/mobile-keyboard/apod-1440.png)
- [Mobile navigation](screenshots/mobile-keyboard/navigation-390.png)
- [Mobile footer status](screenshots/mobile-keyboard/status-390.png)
- [Desktop footer status](screenshots/mobile-keyboard/status-1440.png)

Captures use mocked APOD data and a local mission image.
