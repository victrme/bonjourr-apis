# Bonjourr APIs

This is Bonjourr API system.

It is only usable as a cloudflare worker since it uses features like `waitUntil` or geolocation in request.  
With a bit of tweaking, it can be deployed on other serverless hosting platforms.

## Install

-   [Install pnpm](https://pnpm.io/installation) on your system for convenience
-   Fork this repository. (future me can skip this step)
-   Install quotes, favicon, and suggestions
-   Add your secrets to a `.dev.vars` for local dev to work

```bash

# Install the dependencies
pnpm install

# Fetch the apis on your device
pnpm apis:init

# should work
pnpm dev
```
```yaml
# .dev.vars

WEATHER=comma,separated,strings
UNSPLASH=string
```

This is what your terminal should look like:
```bash
> pnpm install

# devDependencies:
# + @cloudflare/workers-types .0.00000000.0
# + vitest 0.0.0
# + wrangler 0.0.0

> pnpm apis:init

# Sous-module 'src/apis/favicon' (...) enregistré pour le chemin 'src/apis/favicon'
# Sous-module 'src/apis/quotes' (...) enregistré pour le chemin 'src/apis/quotes'
# Sous-module 'src/apis/suggestions' (...) enregistré pour le chemin 'src/apis/suggestions'
# Chemin de sous-module 'src/apis/favicon' : '...' extrait
# Chemin de sous-module 'src/apis/quotes' : '...' extrait
# Chemin de sous-module 'src/apis/suggestions' : '...' extrait

> pnpm dev

# Your worker has access to the following bindings:
# - Vars:
#  - WEATHER: "(hidden)"
#  - UNSPLASH: "(hidden)"
# ⎔ Starting local server...
# [wrangler:inf] Ready on http://127.0.0.1:8787
```

## Update

For skill issue reasons, bonjourr-apis does not automatically deploy remote apis updates.  
To deploy a new update:

- Make sure remote apis are initialized using `pnpm apis:init`
- Once added to your device, update with `pnpm apis:sync`
- A submodule file should update showing the latest commit hash from the remote api
- Push a new commit with that file

```bash
> pnpm apis:init

# ...
# see above

> pnpm apis:sync

# Chemin de sous-module 'src/apis/favicon' : '10f7fd5d8a714f358080b917c74c91b859ce3a88' extrait
```

## Deploy

### With Github Actions

Add repository secrets for Github Action in [Settings > Secrets and Variables > Actions](https://github.com/victrme/bonjourr-apis/settings/secrets/actions):

-   `CF_API_TOKEN` (the single api token for all accounts that you forgot)
-   `CF_MAIN_ACCOUNT_ID`
-   `WEATHER`
-   `UNSPLASH`

### Manually

```bash
# Using account with token
wrangler login

# To the account you want
wrangler deploy
```

## Enpoints

### Unsplash

```http
GET /unsplash/photos/random
```

```typescript
type Photo = {
  color: string
  blur_hash: string
  description: string
  exif: {
    make: string
    model: string
    exposure_time: string
    aperture: string
    focal_length: string
    iso: number
  }
  location: {
    name: string
    city: string
    country: string
  }
  urls: {
    raw: string
  }
  links: {
    html: string
  }
  user: {
    username: string
    name: string
    links: {
      html: string
    }
  }
}[]
```

### Weather

```http
GET /weather
```

```typescript
type Onecall = {
  city?: string
  ccode?: string
  lat: number
  lon: number
  current: {
    dt: number
    sunrise: number
    sunset: number
    temp: number
    feels_like: number
    weather: {
      id: number
      main: string
      description: string
      icon: string
    }[]
  }
  hourly: {
    dt: number
    temp: number
    feels_like: number
    weather: {
      id: number
      main: string
      description: string
      icon: string
    }[]
  }[]
}
```

```http
GET /weather/current
```

```typescript
type Current = {
  name: string
  cod: number
  coord: {
    lon: number
    lat: number
  }
  weather: {
    id: number
    main: string
    description: string
    icon: string
  }[]
  main: {
    temp: number
    feels_like: number
  }
  dt: number
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
}
```

```http
GET /weather/forecast
```

```typescript
type Forecast = {
  cod: string
  list: {
    dt: number
    main: {
      temp: number
      feels_like: number
    }
    weather: {
      id: number
      main: string
      description: string
      icon: string
    }[]
  }[]
}
```

### Fonts

```http
GET /fonts
```

```typescript
type Fonts = {
  family: string
  subsets: string[]
  weights: number[]
  variable: boolean
}[]
```

### Quotes

```http
GET /quotes/classic/:lang
```
```http
GET /quotes/kaamelott
```
```http
GET /quotes/inspirobot
```
```typescript
type Quotes = {
  author: string
  content: string
}[]
```

### Suggestions

```http
GET /suggestions
```

```typescript
type Suggestions = {
  text: string
  desc?: string
  image?: string
}[]
```

### Favicon

```http
GET /favicon/text/:url
```
```typescript
type Favicon = string
```

```http
GET /favicon/blob/:url
```
```typescript
type Favicon = Blob
```
