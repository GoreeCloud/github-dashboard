# GC UI migration — GitHub Dashboard (development)

Status: **isolated GC UI source/runtime candidate; product-level and production acceptance pending**.

Design authority: [GoreeCloud/gc-ui](https://github.com/GoreeCloud/gc-ui) (exclusive first-party GoreeCloud UI system). This repository vendors `styles/tokens.css` into `public/gc-ui-foundations.css` from GC UI Git blob `3ffe26a1c62f59a2ee3c9478dcb31ecc0f9cf444`. The source is pinned for reproducibility rather than loaded from a runtime CDN. The dashboard does not claim that the experimental GC UI workspace is Stable.

## Implemented on the development branch

- The overview and governance pages load first-party GC UI foundation semantic tokens and `public/gc-ui-adapter.css` after inherited styles, using Lagoon accent.
- The existing appearance controller reflects System, Light, Dark and Deep Dark into the GC UI `data-mode` namespace. System mode responds to operating-system appearance changes.
- The transitional GC UI consumer bridge ensures its adapter stylesheet is last, identifies GC UI as the current design authority, and leaves acceptance marked pending.
- GC UI colors, text, outlines, durable surfaces, navigation and reduced-motion/forced-colors fallbacks are mapped to the existing functional layouts without changing any GitHub API endpoint or privilege.
- Narrow mobile governance toolbar and 200% enlarged-text reflow defects were corrected.

## Verification and caveats

Synthetic fixture Chromium smoke at viewport widths 320/390/768/1280 CSS pixels covered the overview and governance screens, computed GC UI canvas values in light/dark modes, four-mode appearance interaction, and lack of document-wide horizontal overflow with 200% enlarged text. The dedicated attention view received the same-size interaction and reflow smoke separately. Automated source validation remains part of branch CI. These are **development observations only**.

The retired browser design runtime files have been removed from this isolated development branch. The source uses a scoped GoreeCloud UI Foundations target; current five-MIPS integration is evaluated separately, without a retired evaluator. Complete GC UI, assistive technology, authenticated runtime, and production acceptance remain unverified.

Still required before release: authenticated private API integration and fail-closed access verification, actual assistive-technology and keyboard testing, full GC UI component conformance and remaining runtime removal, representative deployment configuration and rollback verification, and all applicable GoreeCloud platform system gates. PRs remain Draft; no production deployment is asserted.

## Repeatable local browser check

Install Playwright Core for the local test runner only: `npm install --no-save --no-package-lock playwright-core`. Run `GC_CHROMIUM_PATH=/path/to/chromium node scripts/browser-gc-ui-smoke.mjs`. The script binds to loopback, serves repository static files with synthetic unavailable-API fixtures and checks responsive layout, appearance modes, navigation and 200% text reflow. It neither uses production data nor proves authenticated integration.
