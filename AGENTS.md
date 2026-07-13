# Bonjourr APIs

Monorepo for [Bonjourr](https://bonjourr.fr) Startpage backend. Two Cloudflare Workers.

For human-readable setup and deploy instructions, see [README.md](README.md).
For API route details, see [docs/SERVICES.md](docs/SERVICES.md) and [docs/WEATHER.md](docs/WEATHER.md).

## Workers

| Worker | Path | Dev port | Purpose |
|---|---|---|---|
| services | `services/` | 8787 | Backgrounds, fonts, proxy, suggestions, favicon, quotes, kofi |
| weather | `weather/` | 8888 | Weather API (wraps `meteo` submodule) |

## Commands

| Task | Command |
|---|---|
| Dev services | `deno task services` |
| Dev weather | `deno task weather` |
| Test services | `deno task test:services` (needs wrangler dev running) |
| Test weather | `deno task test:weather` (needs wrangler dev running) |
| Init submodules | `deno task init` |
| Sync submodules | `deno task sync` |
| Format | `deno fmt` |
| Lint | `deno lint` |

CI starts wrangler dev before tests. Locally, run the matching dev server first.

## Project layout

```
services/src/
  index.ts              # Router — dispatches by first path segment
  backgrounds/          # Background providers
  fonts.ts, proxy.ts, kofi.ts
  suggestions/          # submodule
  favicon/              # submodule
  quotes/               # submodule

weather/
  index.ts              # Thin wrapper around meteo submodule
  meteo/                # submodule
```

## Submodules

Never edit files inside submodules. Changes go to their upstream repos, then bump the submodule pointer here.

| Path | Repository |
|---|---|
| `weather/meteo` | https://github.com/victrme/racle-meteo |
| `services/src/suggestions` | https://github.com/victrme/search-suggestions |
| `services/src/favicon` | https://github.com/victrme/favicon-fetcher |
| `services/src/quotes` | https://github.com/victrme/i18n-quotes |

To update a submodule: `deno task sync`, commit the changed submodule ref, push.

## Code style

Defined in root `deno.json`: tabs, 4-space indent, 120 col width, single quotes, no semicolons. Lint/format excludes submodule paths. `deno fmt` and `deno lint` apply to non-submodule `.ts` files.

## Adding a backgrounds endpoint

See [docs/SERVICES.md](docs/SERVICES.md) for route listing. General pattern:

1. Add file at `services/src/backgrounds/<provider>/<format>/<name>.ts`
2. Name functions like `providerFormatCategory()`
3. Register route in `services/src/backgrounds/backgrounds.ts`
4. Follow existing provider patterns (unsplash, pixabay, metmuseum)

## Conventions for agents

- Edit only non-submodule files unless explicitly asked to work upstream
- Keep changes scoped — services and weather are independent workers
- Match existing patterns in `backgrounds/` when adding providers
- Don't commit `.dev.vars` or secrets
- Don't create commits or PRs unless asked