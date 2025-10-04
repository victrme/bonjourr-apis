# Bonjourr APIs

This is Bonjourr API system.

## Development

Bonjourr APIs needs both Node and Deno runtimes to work. Node for Cloudflare's wrangler, Deno for everything else.
- Install [Nodejs](https://nodejs.org/en)
- Then install [Deno runtime](https://deno.com/)
- Clone this repository
- Add a `.dev.vars` file to `/services/` with Unsplash and Pixabay API keys
- Install development dependencies using Deno with `deno install`
- Initialize linked submodules with `deno task init`
- Start a weather dev server with `deno task weather`
- Same this for services

```yaml
# .dev.vars

UNSPLASH=string
PIXABAY=string
```

Following these steps, this is what your terminal should look like:

```bash
> curl -fsSL https://deno.land/install.sh | sh

# Archive:  /Users/.../.deno/bin/deno.zip
# Deno was installed successfully to /Users/.../.deno/bin/deno

> deno install

# ...

> deno task init

# git submodule update --init

# Cloning into '/Users/.../bonjourr-apis/services/src/favicon'...
# Cloning into '/Users/.../bonjourr-apis/services/src/quotes'...
# Cloning into '/Users/.../bonjourr-apis/services/src/suggestions'...
# Cloning into '/Users/.../bonjourr-apis/weather/meteo'...
# Submodule path 'services/src/favicon': checked out 'e792f99a82fe6c29b8b207fc8abe9aae45106fc6'
# Submodule path 'services/src/quotes': checked out '3c6715fce8f9036ec2f71b6c9c8433f43848057a'
# Submodule path 'services/src/suggestions': checked out '6d6a98a6f717a614435eaf3988c777602b7f9f43'
# Submodule path 'weather/meteo': checked out '9587a5ef557a5156473cce2d6fb92b64432c7815'

> deno task services

# npx wrangler dev --cwd services

# Your worker has access to the following bindings:
# - Vars:
#  - UNSPLASH: "(hidden)"
#  - UNSPLASH: "(hidden)"
# ⎔ Starting local server...
# [wrangler:inf] Ready on http://127.0.0.1:8787

> deno task weather

# npx wrangler dev --cwd weather

# ⎔ Starting local server...
# [wrangler:inf] Ready on http://127.0.0.1:8888
```

### Update

For skill issue reasons, bonjourr-apis does not automatically deploy remote apis updates.

To deploy a new update:

- Make sure remote apis are initialized using `git submodule update --init`
- Once added to your device, update with `git submodule update --remote`
- A submodule file should update showing the latest commit hash from the remote api
- Push a new commit with that file

```bash
> git submodule update --init

# ...
# see above

> git submodule update --remote

# Chemin de sous-module 'src/apis/favicon' : '10f7fd5d8a714f358080b917c74c91b859ce3a88' extrait
```

## Deploy

### With Github Actions

Add repository secrets for Github Action in
[Settings > Secrets and Variables > Actions](https://github.com/victrme/bonjourr-apis/settings/secrets/actions):

- `CF_API_TOKEN` (the single api token for all accounts that you forgot)
- `CF_MAIN_ACCOUNT_ID`
- `UNSPLASH`
- `PIXABAY`

## Services

### Backgrounds

#### Current providers & endpoints

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

#### Add another endpoint

1. Go to backgrounds base directory: [bonjourr-apis/services/src/backgrounds](https://github.com/victrme/bonjourr-apis/tree/main/services/src/backgrounds)
2. Keep file structure: `<provider>/<format>/<name>.ts`
3. Keep function names like: `providerFormatCategory()`
4. Finally Add endpoint in `services/src/backgrounds/backgrounds.ts`
