# Bonjourr APIs

This is Bonjourr API system.

It is only usable as a cloudflare worker since it uses features like `waitUntil` or geolocation in request.  
With a bit of tweaking, it can be deployed on other serverless hosting platforms.

## Install

-   Fork this repository. (future me can skip this step)
-   Initialize the submodules for quotes, favicon, and suggestions.
-   Add your secrets to a `.dev.vars` for local dev to work

```bash
# Global tools
npm install --global wrangler pnpm

# Initialize the submodules
pnpm git:init

# For cloudflare types
pnpm i

# should work
wrangler dev
```

```yaml
# .dev.vars

WEATHER=comma,separated,strings
UNSPLASH=string
```

## Deploy on Cloudflare

### With Github Actions

/!\ Work in progress  
Add repository secrets for Github Action in [Settings > Secrets and Variables > Actions](https://github.com/victrme/bonjourr-apis/settings/secrets/actions):

-   `CF_API_TOKEN` (the single api token for all accounts that you forgot)
-   `CF_MAIN_ACCOUNT_ID`
-   `CF_FALLBACK_1_ACCOUNT_ID`
-   `CF_FALLBACK_2_ACCOUNT_ID`
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
