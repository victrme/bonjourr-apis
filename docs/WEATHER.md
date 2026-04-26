# Racle météo

This service cleverly transforms weather web pages into a usable (and free!) rest API. It uses [accuweather](https://accuweather.com) and/or
[foreca](https://foreca.com) under the hood.

- Sturdy: Uses other providers as fallback to guarentee a response if a provider becomes invalid
- Flexible: Easy to update with strong typing and htmlparser2 as basic parser
- Compatible: Pure typescript using deno and small dependencies means you can install it almost anywhere

## Install

Deploy a [Cloudflare Worker](https://developers.cloudflare.com/workers/) to start using your own racle-meteo. You do not need any API key.
Migrating to another cloud provider or your own server will remove the automatic location.

A slimmed-down version of [htmlparser2 10.0.0](https://github.com/fb55/htmlparser2/) is included. No dependency installation is needed.

```bash
deno task dev
# Task dev npx wrangler dev
# ⎔ Starting local server...
# [wrangler:inf] Ready on http://localhost:8787

deno task deploy
# Task deploy npx wrangler deploy
# Total Upload: 179.64 KiB / gzip: 60.84 KiB
# Uploaded racle-meteo (25.80 sec)

deno task test
# ok | 4 passed | 0 failed (3s)
```

## Use

Define a weather provider to start using the API.

### Parameters

| Parameter | Type                                      | Required | Description                                                                                                                                  |
| --------- | ----------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| provider  | accuweather, foreca, ~~weathercom~~, auto | required | Choose the weather provider. "Auto" returns "simple" data, specific providers returns all, see "data".                                       |
| geo       | any                                       | optional | Geo returns a list of found locations.                                                                                                       |
| query, q  | string                                    | optional | Matches a location based on your query. Best to use as "City,CountryCode". Adding "query" overrides "lat" & "lon" parameters.                |
| lat       | string                                    | optional | Location latitude.                                                                                                                           |
| lon       | string                                    | optional | Location longitude.                                                                                                                          |
| lang      | string                                    | optional | English by default. Some languages are only available on accuweather, see language list below. Incorrect `lang` fallback to english.         |
| unit      | C, F                                      | optional | Useful for accuweather or when using "simple" data. Foreca always returns celsius and farenheit.                                             |
| data      | all, simple                               | optional | Select "all" to retrieve all the data from the provider's webpage. "simple" returns only data available for all providers. "all" by default. |
| debug     | nodes, content                            | optional | Debugging "nodes" returns a list of found html tags. "content" shows strings collected before being manipulated.                             |

## Response example

### Query

| provider | lang | unit | data   |
| -------- | ---- | ---- | ------ |
| foreca   | fr   | C    | simple |

#### Response

```jsonc
{
  "meta": {
    "url": "https://www.foreca.com/en/102988507/Paris",
    "lang": "en",
    "provider": "foreca"
  },
  "geo": {
    "lat": 48.853,
    "lon": 2.348,
    "city": "Paris",
    "country": "FR"
  },
  "now": {
    "icon": "rain",
    "description": "Overcast and rain",
    "temp": 13,
    "feels": 13
  },
  "sun": {
    "rise": [8, 7],
    "set": [19, 5]
  },
  "daily": [
    { "time": "2024-10-12T11:00:00.000Z", "high": 16, "low": 13 },
    { "time": "2024-10-13T11:00:00.000Z", "high": 14, "low": 10 }
    // ...
  ]
}
```

## Simple icon equivalences

- Accuweather: https://developer.accuweather.com/weather-icons
- Foreca: https://developer.foreca.com/resources

As a union:

```plaintext
clearsky | fewclouds | brokenclouds | overcastclouds | sunnyrain | lightrain | rain | thunderstorm | snow | mist
```

Equivalence between other providers:

```jsonc
{
  "clearsky": {
    "accuweather": "1, 2, 33, 34",
    "foreca": "d000, d100, n000, n100"
  },
  "fewclouds": {
    "accuweather": "3, 4, 5, 35, 36, 37",
    "foreca": "d200, d500, n200, n500"
  },
  "brokenclouds": {
    "accuweather": "6, 7, 38",
    "foreca": "d300, n300"
  },
  "overcastclouds": {
    "accuweather": "8",
    "foreca": "d400, n400"
  },
  "sunnyrain": {
    "accuweather": "14, 17",
    "foreca": "d210, n210"
  },
  "lightrain": {
    "accuweather": "12, 13, 39",
    "foreca": "d310, d410, d240, n310, n410, n240"
  },
  "rain": {
    "accuweather": "18, 19, 29, 40",
    "foreca": "d320, d420, d430, n320, n420, n430"
  },
  "thunderstorm": {
    "accuweather": "15, 16, 41, 42",
    "foreca": "d340, d440, n340, n440"
  },
  "snow": {
    "accuweather": "20, 21, 22, 23, 24, 25, 26, 43, 44",
    "foreca": "d221, d311, d411, d221, d321, d431, d212, d312, d412, d222, d322, d422, d432, n221, n311, n411, n221, n321, n431, n212, n312, n412, n222, n322, n422, n432"
  },
  "mist": {
    "accuweather": "11",
    "foreca": "d600, n600"
  }
}
```

## Languages available

Language codes are following the ISO-639 standard. A wrong language throws an error. Sanitized so that:

- `lang` is case insensitive
- `-` or `_` works
- `pt` resolves to `pt-pt`
- localization (-XX) is removed with `foreca`

| code  | name                    | foreca | accuweather |
| ----- | ----------------------- | ------ | ----------- |
| en    | English                 | true   | true        |
| es    | Español                 | true   | true        |
| fr    | Français                | true   | true        |
| da    | Dansk                   | true   | true        |
| pt-pt | Português               |        | true        |
| nl    | Nederlands              | true   | true        |
| no    | Norsk                   |        | true        |
| it    | Italiano                | true   | true        |
| de    | Deutsch                 | true   | true        |
| sv    | Svenska                 | true   | true        |
| fi    | Suomi                   |        | true        |
| zh-hk | 中文 (HK)               |        | true        |
| zh-cn | 中文 (SIM)              |        | true        |
| zh-tw | 中文 (Taiwan)           |        | true        |
| es-ar | Español (Argentina)     |        | true        |
| es-mx | Español (Latin America) |        | true        |
| sk    | Slovenčinu              | true   | true        |
| ro    | Romana                  | true   | true        |
| cs    | Čeština                 | true   | true        |
| hu    | Magyar                  | true   | true        |
| pl    | Polski                  | true   | true        |
| ca    | Català                  |        | true        |
| pt-br | Português (Brazil)      |        | true        |
| hi    | हिन्दी                   |        | true        |
| ru    | русский                 | true   | true        |
| ar    | عربي                    |        | true        |
| el    | Ελληνικά                | true   | true        |
| en-gb | English (UK)            |        | true        |
| ja    | 日本語                  |        | true        |
| ko    | 한국어                  |        | true        |
| tr    | TÜRKÇE                  |        | true        |
| fr-ca | Français (Canada)       |        | true        |
| he    | עברית                   |        | true        |
| sl    | Slovenski               |        | true        |
| uk    | Українське              | true   | true        |
| id    | Bahasa Indonesia        |        | true        |
| bg    | български               | true   | true        |
| et    | Eesti keeles            | true   | true        |
| hr    | Hrvatski                | true   | true        |
| kk    | Қазақша                 |        | true        |
| lt    | Lietuvių                |        | true        |
| lv    | Latviski                | true   | true        |
| mk    | Македонски              |        | true        |
| ms    | Bahasa Melayu           |        | true        |
| tl    | Tagalog                 |        | true        |
| sr    | Srpski                  |        | true        |
| th    | ไทย                     |        | true        |
| vi    | Tiếng Việt              |        | true        |
| fa    | فارسی                   |        | true        |
| bn    | বাংলা                     |        | true        |
| bs    | bosanski                |        | true        |
| is    | íslenska                |        | true        |
| sw    | Kiswahili               |        | true        |
| ur    | اُردُو                    |        | true        |
| sr-me | Crnogorski              |        | true        |
| uz    | Oʻzbekcha               |        | true        |
| az    | Azərbaycanca            |        | true        |
| ta    | தமிழ்                    |        | true        |
| gu    | ગુજરાતી                  |        | true        |
| kn    | ಕನ್ನಡ                    |        | true        |
| te    | తెలుగు                   |        | true        |
| mr    | मराठी                   |        | true        |
| pa    | ਪੰਜਾਬੀ                   |        | true        |
| my    | မြန်မာဘာသာ               |        | true        |
