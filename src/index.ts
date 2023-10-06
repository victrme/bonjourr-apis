import faviconFetcher from '../apis/favicon/src/index'
import classicQuotes from '../apis/quotes/cloudflare-worker/classic'
import kaamelottQuotes from '../apis/quotes/cloudflare-worker/kaamelott'
import inspirobotQuotes from '../apis/quotes/cloudflare-worker/inspirobot'
import suggestions from '../apis/suggestions/src/handler'

const headers = {
	'access-control-allow-origin': '*',
	'cache-control': 'public, maxage=3600',
}

export default {
	async fetch(request: Request) {
		const path = new URL(request.url).pathname

		console.log(path)

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
