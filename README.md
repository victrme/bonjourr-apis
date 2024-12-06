# Bonjourr APIs

This is Bonjourr API system.

## Install

-   [Install pnpm](https://pnpm.io/installation) on your system for convenience
-   Fork this repository. (future me can skip this step)
-   Install quotes, favicon, and suggestions
-   Add your secrets to a `.dev.vars` for local dev to work

```yaml
# .dev.vars

UNSPLASH=string
```

This is what your terminal should look like:

```bash
> pnpm install --recursive

# devDependencies:
# + vitest 0.0.0
# + wrangler 0.0.0

# weather      |   +6 +
# weather      | Progress: resolved 6, reused 6, downloaded 0, added 6, done

> git submodule update --remote

# Sous-module 'src/apis/favicon' (...) enregistré pour le chemin 'src/apis/favicon'
# Sous-module 'src/apis/quotes' (...) enregistré pour le chemin 'src/apis/quotes'
# Sous-module 'src/apis/suggestions' (...) enregistré pour le chemin 'src/apis/suggestions'
# Chemin de sous-module 'src/apis/favicon' : '...' extrait
# Chemin de sous-module 'src/apis/quotes' : '...' extrait
# Chemin de sous-module 'src/apis/suggestions' : '...' extrait

> pnpm services

# Your worker has access to the following bindings:
# - Vars:
#  - UNSPLASH: "(hidden)"
# ⎔ Starting local server...
# [wrangler:inf] Ready on http://127.0.0.1:8787

> pnpm weather

# ⎔ Starting local server...
# [wrangler:inf] Ready on http://127.0.0.1:8888
```

## Update

For skill issue reasons, bonjourr-apis does not automatically deploy remote apis updates.  
To deploy a new update:

-   Make sure remote apis are initialized using `pnpm apis:init`
-   Once added to your device, update with `pnpm apis:sync`
-   A submodule file should update showing the latest commit hash from the remote api
-   Push a new commit with that file

```bash
> git submodule update --init

# ...
# see above

> git submodule update --remote

# Chemin de sous-module 'src/apis/favicon' : '10f7fd5d8a714f358080b917c74c91b859ce3a88' extrait
```

## Deploy

### With Github Actions

Add repository secrets for Github Action in [Settings > Secrets and Variables > Actions](https://github.com/victrme/bonjourr-apis/settings/secrets/actions):

-   `CF_API_TOKEN` (the single api token for all accounts that you forgot)
-   `CF_MAIN_ACCOUNT_ID`
-   `UNSPLASH`
