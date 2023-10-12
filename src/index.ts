import faviconFetcher from '../apis/favicon/src/index'
import classicQuotes from '../apis/quotes/cloudflare-worker/classic'
import kaamelottQuotes from '../apis/quotes/cloudflare-worker/kaamelott'
import inspirobotQuotes from '../apis/quotes/cloudflare-worker/inspirobot'
import suggestions from '../apis/suggestions/src/handler'

const headers = {
	'access-control-allow-origin': '*',
	'cache-control': 'public, maxage=3600',
}

export interface Env {
	UNSPLASH: string
	WEATHER: string
}

export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url)
		const path = url.pathname

		if (path.startsWith('/unsplash') && request.url.includes('?')) {
			try {
				const params = request.url.split('?')[1]
				const fetchURL = `https://api.unsplash.com/photos/random?${params}`
				const fetchHeaders = { 'Accept-Version': 'v1', Authorization: `Client-ID ${env.UNSPLASH}` }

				const resp = await fetch(fetchURL, { headers: fetchHeaders })
				const json = await resp.json()

				return new Response(JSON.stringify(json), {
					status: resp.status,
					headers: {
						...headers,
						'Content-Type': 'application/json',
					},
				})
			} catch (error) {
				console.log(error)
			}
		}

		if (path.startsWith('/weather/') && path.match(/current|forecast/) && request.url.includes('?')) {
			const key = env.WEATHER
			const params = request.url.split('?')[1]
			const pathname = path.includes('forecast') ? 'forecast' : 'weather'
			const fetchURL = `https://api.openweathermap.org/data/2.5/${pathname}?appid=${key}&${params}`

			try {
				const resp = await fetch(fetchURL)
				const json = await resp.json()
				return new Response(JSON.stringify(json), {
					status: resp.status,
					headers: {
						...headers,
						'Content-Type': 'application/json',
					},
				})
			} catch (error) {
				console.log(error)
			}
		}

		if (path.startsWith('/favicon')) {
			const url = path.replace('/favicon/', '')
			const icon = await faviconFetcher(url)
			return new Response(icon, { status: 200, headers })
		}

		if (path.startsWith('/quotes/classic')) {
			const lang = path.replace('/quotes/classic/', '')
			const quotes = await classicQuotes(lang)

			return new Response(JSON.stringify(quotes), {
				status: 200,
				headers: { ...headers, 'Content-Type': 'application/json' },
			})
		}

		if (path.startsWith('/quotes/kaamelott')) {
			const quotes = await kaamelottQuotes()

			return new Response(JSON.stringify(quotes), {
				status: 200,
				headers: { ...headers, 'Content-Type': 'application/json' },
			})
		}

		if (path.startsWith('/quotes/inspirobot')) {
			const quotes = await inspirobotQuotes()

			return new Response(JSON.stringify(quotes), {
				status: 200,
				headers: { ...headers, 'Content-Type': 'application/json' },
			})
		}

		if (path.startsWith('/suggestions')) {
			const result = await suggestions(request.url)

			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { ...headers, 'Content-Type': 'application/json' },
			})
		}

		return new Response('Not a correct path', {
			status: 404,
			headers: headers,
		})
	},
}
