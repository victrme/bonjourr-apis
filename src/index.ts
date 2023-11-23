//@ts-ignore
import html from './index.html'
import weather from './apis/weather'
import unsplash from './apis/unsplash'
import quotes from './apis/quotes/src/index'
import favicon from './apis/favicon/src/worker'
import suggestions from './apis/suggestions/src/worker'
import fonts from './apis/fonts'

const headers = new Headers({
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Max-Age': '3600',
})

interface Env {
	UNSPLASH?: string
	WEATHER?: string
	FONTS?: string
}

export default {
	async fetch(req: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(req.url)
		const path = url.pathname.split('/')[1] ?? ''

		switch (path) {
			case 'unsplash':
				return await unsplash(req.url, env.UNSPLASH ?? '', headers)

			case 'weather':
				return await weather(req, ctx, env.WEATHER ?? '', headers)

			case 'font':
				return await fonts(req, ctx, env.FONTS ?? '', headers)

			case 'suggestions':
				return await suggestions.fetch(req)

			case 'favicon':
				return await favicon.fetch(req)

			case 'quotes':
				return await quotes.fetch(req, env, ctx)

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
