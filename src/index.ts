//@ts-expect-error
import html from './index.html'
import proxy from './apis/proxy.ts'
import fonts from './apis/fonts.ts'
import weather from './apis/weather.ts'
import unsplash from './apis/unsplash.ts'
import quotes from './apis/quotes/src/index.ts'
import favicon from './apis/favicon/cloudflare/index.ts'
import suggestions from './apis/suggestions/cloudflare/index.ts'

const headers = new Headers({
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Max-Age': '3600',
})

interface Env {
	UNSPLASH?: string
	WEATHER?: string
}

export default {
	async fetch(req: Request, env: Env) {
		const url = new URL(req.url)
		const path = url.pathname.split('/')[1] ?? ''

		switch (path) {
			case 'unsplash':
				return await unsplash(req.url, env.UNSPLASH ?? '', headers)

			case 'weather':
				return await weather(req, headers)

			case 'fonts':
				return await fonts(headers)

			case 'suggestions':
				return await suggestions.fetch(req)

			case 'favicon':
				return await favicon.fetch(req)

			case 'quotes':
				return await quotes.fetch(req)

			case 'proxy':
				return await proxy(req)

			case '': {
				headers.set('Content-Type', 'text/html')
				return new Response(html, { headers })
			}

			default:
				return new Response('Not found', {
					status: 404,
					headers,
				})
		}
	},
}
