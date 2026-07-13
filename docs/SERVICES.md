# Services

Last written: 2026-07-13

Everything in Bonjourr that is not weather. Deployed as a Cloudflare Worker.

## Architecture

Router in `src/index.ts` dispatches by first path segment:

- Top-level routes (fonts, proxy, suggestions, quotes, favicon, kofi) go straight to their handler
- `/unsplash` goes to a legacy direct passthrough (restricted to /photos/*)
- `/backgrounds` is further dispatched by `src/backgrounds/backgrounds.ts` which matches subpaths

Provider modules under `src/backgrounds/<provider>/` follow a common pattern:

| Module | Role |
|---|---|
| `types.ts` | Raw API response types |
| `convert.ts` | Maps raw types to unified `Image` / `Video` |
| `shared.ts` | API helpers (fetch, auth, URL mangling) |
| `images/search.ts` etc. | Request handlers returning unified responses |

The `/backgrounds/bonjourr/` namespace is special — it stores and retrieves curated daylight collections from D1 (`COLLECTIONS_DB`), populated from Unsplash, Pexels, and Pixabay via store endpoints.

## Global response headers

All endpoints (except proxy) return:
- Access-Control-Allow-Origin: *
- Access-Control-Allow-Headers: *
- Access-Control-Allow-Methods: GET, OPTIONS
- Access-Control-Max-Age: 3600

## Routes

### GET /

Returns 200 with a plaintext greeting.

---

### GET /fonts

Returns JSON array of popular fonts from Fontsource API, filtered to families that have latin subset, weight 400, and category != icons/other. Ordered by popularity from `FONT_LIST` asset.

```
Cache-Control: public, max-age=604800, immutable
```

Response shape:

```jsonc
[
  {
    "family": "Inter",
    "subsets": ["latin"],
    "weights": [100, 200, 300, 400, 500, 600, 700, 800, 900],
    "variable": true
  }
]
```

Env required: `FONT_LIST` (URL to CSV of popular font family names, one per line).

On fetch failure, returns empty array with `Cache-Control: no-cache`.

---

### POST /proxy

Proxies an HTTP request. Body must be a plain URL string (no JSON wrapping).

```
Cache-Control: max-age=10
Content-Type: text/plain
```

Returns 405 on non-POST, 500 on fetch failure.

---

### GET /suggestions

Wraps search-suggestions submodule. See submodule repo for docs.

Forwarded to `suggestions/src/worker.ts`.

---

### GET /favicon/*

Wraps favicon-fetcher submodule. Subpaths:

| Path | Description |
|---|---|
| `/favicon/text/:url` | Returns SVG text favicon |
| `/favicon/blob/:url` | Returns image blob favicon |
| `/favicon/list/:url` | Returns list of discovered favicons |
| `/favicon/debug/:url` | Returns debug info |

Forwarded to `favicon/package/src/index.ts`.

---

### GET /quotes/*

Wraps i18n-quotes submodule.

| Path | Description |
|---|---|
| `/quotes` | Random quote, any language |
| `/quotes/:type` | Filter by type (e.g. motivation) |
| `/quotes/:type/:lang` | Filter by type and language code |

Forwarded to `quotes/src/index.ts`.

---

### GET /kofi

Returns Ko-fi transactions from `BONJOURR_DB` for a given month.

Query params:
- `date` (optional) — format `YY-MM`, defaults to `00-00`

Response: JSON array of transaction rows, with `monthly` coerced to boolean.

`GET /list` routes to the same handler.

```
Cache-Control: public, max-age=31536000, immutable
```

### GET /unsplash/* (legacy, deprecated)

Direct passthrough to Unsplash API. Restricted to `/unsplash/photos/*` — any other path returns 403.

Returns raw Unsplash API response (not unified format). No caching.

Deprecated in favor of `/backgrounds/unsplash/...` endpoints.

---

### GET /backgrounds

Dispatch hub. Subpath matching is done via `string.includes()` so paths can overlap — order matters.

All sub-endpoints return:

```
Content-Type: application/json
Cache-Control: public, max-age=10
```

#### GET /backgrounds/proxy/{encoded_url}

Proxies an image/video URL embedded in the path. Validates content type against:

```
image/jpeg, image/png, image/gif, image/webp, image/svg+xml, video/mp4, video/webm
```

Returns 413 if content exceeds 20 MB. Returns upstream status on error.

```
Cache-Control: max-age=3600
```

---

#### GET /backgrounds/bonjourr/all

Returns all stored media from all daylight collections. Merges Image and Video types into one array.

Collections queried:

```
bonjourr-images-daylight-night
bonjourr-images-daylight-noon
bonjourr-images-daylight-day
bonjourr-images-daylight-evening
bonjourr-videos-daylight-night
bonjourr-videos-daylight-noon
bonjourr-videos-daylight-day
bonjourr-videos-daylight-evening
```

Skips missing collections silently.

---

#### GET /backgrounds/bonjourr/images/daylight

Returns images grouped by daylight period.

Query params:
- `w` (optional, default `1920`) — crop width for Unsplash images
- `h` (optional, default `1080`) — crop height for Unsplash images

Response shape:

```jsonc
{
  "bonjourr-images-daylight-night": [ /* Image[] */ ],
  "bonjourr-images-daylight-noon": [ /* Image[] */ ],
  "bonjourr-images-daylight-day": [ /* Image[] */ ],
  "bonjourr-images-daylight-evening": [ /* Image[] */ ]
}
```

Each collection returns 10 random images from D1.

---

#### GET /backgrounds/bonjourr/videos/daylight

Same shape as images but returns videos:

```jsonc
{
  "bonjourr-videos-daylight-night": [ /* Video[] */ ],
  "bonjourr-videos-daylight-noon": [ /* Video[] */ ],
  "bonjourr-videos-daylight-day": [ /* Video[] */ ],
  "bonjourr-videos-daylight-evening": [ /* Video[] */ ]
}
```

No query params.

---

#### GET /backgrounds/bonjourr/images/daylight/store

Re-fetches all daylight image collections from Unsplash, stores them in `COLLECTIONS_DB` tables, and returns the result. Can be slow (pages through up to 100 pages per collection).

When `TESTING` env var is set, only fetches 1 random photo per collection (for dev/test).

Response shape: same as the GET daylight endpoint.

---

#### GET /backgrounds/bonjourr/videos/daylight/store

Same as the image store but for videos. Fetches from:
- Pexels collections (`PEXELS_COLLECTIONS` hardcoded, uses `PEXELS` API key)
- Pixabay collections (from `PIXABAY_COLLECTIONS` asset URL, uses `PIXABAY` API key)

---

#### GET /backgrounds/unsplash/images/search

Returns random Unsplash photos matching a query.

Query params:
- `query` (optional) — search term
- `orientation` (optional, default `landscape`)
- `w` (optional, default `1920`) — crop width
- `h` (optional, default `1080`) — crop height

Response:

```jsonc
{
  "unsplash-images-search": [ /* Image[] */ ]
}
```

---

#### GET /backgrounds/unsplash/images/collections

Returns random Unsplash photos from curated collections.

Query params:
- `query` (optional) — collection ID or search
- `orientation` (optional, default `landscape`)
- `w` (optional, default `1920`) — crop width
- `h` (optional, default `1080`) — crop height

Response:

```jsonc
{
  "unsplash-images-collections": [ /* Image[] */ ]
}
```

---

#### GET /backgrounds/pixabay/images/search

Query params:
- `query` (optional) — search term
- `orientation` (optional, default `all`)

Response:

```jsonc
{
  "pixabay-images-search": [ /* Image[] */ ]
}
```

---

#### GET /backgrounds/pixabay/videos/search

Query params:
- `query` (optional) — search term
- `orientation` (optional, default `all`)

Response:

```jsonc
{
  "pixabay-videos-search": [ /* Video[] */ ]
}
```

---

#### GET /backgrounds/metmuseum/images/paintings

Returns random paintings from a pre-filtered list of Met Museum object IDs that have valid images.

Query params:
- `amount` (optional, default `10`, max `40`) — number of images to return

Fetches from GitHub raw asset `metmuseum_paintings.txt`.

Response:

```jsonc
{
  "metmuseum-images-paintings": [ /* Image[] */ ]
}
```

---

#### GET /backgrounds/metmuseum/images/search

Returns random Met Museum objects matching a keyword.

Query params:
- `amount` (optional, default `10`, max `40`) — number of images to return
- `search` (optional, default `1`) — search keyword (numeric)

Response:

```jsonc
{
  "metmuseum-images-search": [ /* Image[] */ ]
}
```

---

#### GET /backgrounds/metmuseum/images/filter

Scans all object IDs in the pre-filtered list, validates they have valid `primaryImage` and `primaryImageSmall`, returns array of valid object IDs.

No params. Can be slow (processes all IDs in batches of 48).

Response: JSON array of numbers.

---

## Current providers & endpoints

|  Provider | Format |     name    | Query? | Public? |
|:---------:|:------:|:-----------:|:------:|:-------:|
|  Bonjourr | images |    store    |        |         |
|  Bonjourr | videos |    store    |        |         |
|  Bonjourr |  both  |     all     |        |         |
|  Bonjourr | images |   daylight  |        |    x    |
|  Bonjourr | videos |   daylight  |        |    x    |
|           |        |             |        |         |
|  Unsplash | images |    search   |    x   |    x    |
|  Unsplash | images | collections |    x   |    x    |
|           |        |             |        |         |
|  Pixabay  | images |    search   |    x   |    x    |
|  Pixabay  | videos |    search   |    x   |    x    |
|           |        |             |        |         |
| METMuseum | images |    filter   |        |         |
| METMuseum | images |    search   |    x   |    x    |
| METMuseum | images |  paintings  |        |    x    |



## Unified response types

All background endpoints return images and videos in these shapes:

### Image

```jsonc
{
  "format": "image",
  "page": "https://unsplash.com/photos/abc123",
  "username": "photographer_name",
  "urls": {
    "full": "https://...",   // ~1920x1080
    "medium": "https://...", // ~960x540
    "small": "https://..."   // ~192x108
  },
  // Unsplash-only fields:
  "color": "#aabbcc",
  "name": "Photographer Full Name",
  "city": "Paris",
  "country": "France",
  "download": "https://unsplash.com/photos/abc123/download",
  "exif": {
    "make": "Canon",
    "model": "EOS R5",
    "exposure_time": "1/200",
    "aperture": "f/2.8",
    "focal_length": "35mm",
    "iso": 400
  }
}
```

### Video

```jsonc
{
  "format": "video",
  "page": "https://pixabay.com/videos/123",
  "username": "creator_name",
  "duration": 30,
  "thumbnail": "https://...",
  "urls": {
    "full": "https://...",   // highest resolution
    "medium": "https://...", // mid resolution
    "small": "https://..."   // lowest resolution
  }
}
```

## Environment variables

| Variable | Required | Used by |
|---|---|---|
| `UNSPLASH` | For Unsplash backgrounds | Unsplash shared helpers, legacy `/unsplash` |
| `PIXABAY` | For Pixabay backgrounds | Pixabay search + daylight store |
| `PEXELS` | For daylight video store | Pexels metadata store |
| `FONT_LIST` | Yes | fonts.ts — URL to popularity CSV |
| `PIXABAY_COLLECTIONS` | For daylight video store | Pixabay metadata store — URL to JSON mapping |
| `BONJOURR_DB` | Yes (D1 binding) | kofi.ts |
| `COLLECTIONS_DB` | Yes (D1 binding) | Backgrounds store/get (all daylight collections) |
| `GEMINI_API_KEY` | No | Currently unused in code |
| `TESTING` | No | If truthy, Unsplash store fetches 1 photo per collection instead of all pages |

## D1 databases

### COLLECTIONS_DB

Dynamic tables, one per collection name. Schema:

```sql
CREATE TABLE IF NOT EXISTS "<collection_name>" (
  id TEXT PRIMARY KEY,
  data JSON NOT NULL
);
```

Collection naming convention:
- `bonjourr-images-daylight-{night|noon|day|evening}`
- `bonjourr-videos-daylight-{night|noon|day|evening}`

### BONJOURR_DB

Contains `kofi_transactions` table. Schema inferred from usage:

```sql
SELECT * FROM kofi_transactions WHERE date LIKE ?  -- date param: %YY-MM%
```

`monthly` column stored as integer, coerced to boolean in response.

## Assets

Located in `services/assets/`:

| File | Purpose |
|---|---|
| `font_popularity.txt` | Comma-separated font family names, ordered by popularity. Used by fonts endpoint. |
| `metmuseum_paintings.txt` | Comma-separated object IDs that have confirmed images. Used by metmuseum endpoints. |
| `pixabay_collections.json` | JSON mapping Pixabay video IDs to daylight collection names. See wrangler.json `PIXABAY_COLLECTIONS` var. |

## Adding a new background provider

1. Create `services/src/backgrounds/<provider>/` with:
   - `types.ts` — raw API response types
   - `convert.ts` — function mapping raw types to `Image` or `Video`
   - `shared.ts` — API helpers (fetch, auth)
   - `images/<action>.ts` (or `videos/`) — request handler

2. Import and register the handler in `services/src/backgrounds/backgrounds.ts`

3. Add any env vars to the interface in `services/src/index.ts` and to `.dev.vars`

See existing providers (unsplash, pixabay, metmuseum) for reference.