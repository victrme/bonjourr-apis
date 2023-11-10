# Bonjourr APIs

This is Bonjourr API system.  
  
It is only usable as a cloudflare worker since it uses features like `waitUntil` or geolocation in request.  
With a bit of tweaking, it can be deployed on other serverless hosting platforms.

## Install

- Fork this repository. (future me can skip this step)
- Initialize the submodules for quotes, favicon, and suggestions.
- Add your secrets to a `.dev.vars` for local dev to work

```bash
# Global tools
npm install --global wrangler pnpm

# Initialize the submodules
git submodule update --init --recursive

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
