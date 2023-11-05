# Bonjourr APIs

This is Bonjourr API system. It is only usable as a cloudflare worker since it leverages service bindings.

## Install

-   You need to clone [favicon-fetcher](https://github.com/victrme/favicon-fetcher), [search-suggestions](https://github.com/victrme/search-suggestions) & [i18n-quotes](https://github.com/victrme/i18n-quotes) and deploy them as workers.
-   Once these workers are deployed, you can also deploy bonjourr-apis
-   Add your weather & unsplash keys as environnement variables as "WEATHER" and "UNSPLASH"

### Deploy

Add repository secrets for Github Action to work:

-   `CF_API_TOKEN` (the api token for workers in all account)
-   `CF_MAIN_ACCOUNT_ID`
-   `CF_FALLBACK_1_ACCOUNT_ID`
-   `CF_FALLBACK_2_ACCOUNT_ID`

```bash
# wrangler is the cli tool for cloudflare
npm install --global wrangler

# You need to login for dev because of remote
wrangler login

# dev needs remote for service bindings to work
wrangler dev --remote

# deploy
wrangler deploy
```
