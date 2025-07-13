# Bonjourr APIs

This is Bonjourr API system.

## Install

- First [Install pnpm](https://pnpm.io/installation) on your system
- Fork this repository. (future me can skip this step)
- Install quotes, favicon, and suggestions
- Add your secrets to a `.dev.vars` for local dev to work

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

> git submodule update --init

# Cloning into 'C:/Users/Victor/Documents/Github/bonjourr-apis/services/src/favicon'...
# Cloning into 'C:/Users/Victor/Documents/Github/bonjourr-apis/services/src/quotes'...
# Cloning into 'C:/Users/Victor/Documents/Github/bonjourr-apis/services/src/suggestions'...
# Cloning into 'C:/Users/Victor/Documents/Github/bonjourr-apis/weather/meteo'...
# Submodule path 'services/src/favicon': checked out 'e792f99a82fe6c29b8b207fc8abe9aae45106fc6'
# Submodule path 'services/src/quotes': checked out '3c6715fce8f9036ec2f71b6c9c8433f43848057a'
# Submodule path 'services/src/suggestions': checked out '6d6a98a6f717a614435eaf3988c777602b7f9f43'
# Submodule path 'weather/meteo': checked out '9587a5ef557a5156473cce2d6fb92b64432c7815'

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

For skill issue reasons, bonjourr-apis does not automatically deploy remote apis updates.\
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
