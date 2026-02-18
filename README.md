# demo-compute-modules-scraper-milwaukee-ts

TypeScript Palantir Compute Module demo that scrapes Milwaukee product data and returns structured tool metadata.

[![TypeScript](https://img.shields.io/badge/TypeScript-%5E5.7.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/docs/)
[![Playwright](https://img.shields.io/badge/Playwright-%5E1.49.1-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/docs/intro)
[![Compute Module](https://img.shields.io/badge/%40palantir%2Fcompute--module-0.2.6-0052CC)](https://www.npmjs.com/package/@palantir/compute-module)
[![Docker](https://img.shields.io/badge/Dockerfile-available-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## What It Does

- Exposes compute-module functions for Milwaukee scraping workflows.
- Scrapes product title, description, specs, features, included items, and image URLs.
- Provides both structured JSON output and formatted text output.
- Includes a local smoke test script for a known MPN (`2880-20`).

## How It Works

- `src/scrapers/MilwaukeeScraper.ts` uses Playwright to load Milwaukee product pages and extract fields.
- `src/index.ts` registers compute module handlers: `addOne`, `scrapeMilwaukee`, `scrapeMilwaukeeFormatted`.
- `src/utils/formatProductData.ts` renders scraped records into a readable text block.

## API Surface

| Function | Input | Output | Notes |
|---|---|---|---|
| `addOne` | `{ value: number }` | `{ value: number }` | Basic sample handler. |
| `scrapeMilwaukee` | `{ mpn: string }` | structured product object | Returns `success: false` with empty fields on scrape failure. |
| `scrapeMilwaukeeFormatted` | `{ mpn: string }` | `string` | Formatted product summary text. |

## Quick Start

```bash
./startup.sh
source startup.sh
npm install
npm run build
npm start
```

Run local smoke test:

```bash
npm test
```

## Testing And CI

| Layer | Present | Tooling | Runs in CI |
|---|---|---|---|
| unit | no | none | no |
| integration | yes | `npm test` (`ts-node src/test.ts`) | no |
| e2e api | no | none | no |
| e2e web | no | none | no |

No CI workflow is currently configured in this repository.

## Deployment And External Services

- Containerized runtime is provided via `Dockerfile`.
- Scraping depends on public Milwaukee product pages at `https://www.milwaukeetool.com/products/<mpn>`.

## License

MIT (`LICENSE`).
