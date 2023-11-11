//@ts-ignore
import html from './index.html'
import weather from './apis/weather'
import unsplash from './apis/unsplash'
import quotes from './apis/quotes/src/index'
import favicon from './apis/favicon/src/worker'
import suggestions from './apis/suggestions/src/worker'

const headers = new Headers({
	'access-control-allow-origin': '*',
	'access-control-allow-headers': '*',
	'access-control-allow-methods': 'GET, OPTIONS',
	'access-control-max-age': '3600',
})

interface Env {
	UNSPLASH?: string
	WEATHER?: string
}

export default {
	async fetch(req: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(req.url)
		const path = url.pathname

		if (path === '/') {
			return new Response(html, { headers: { ...headers, 'content-type': 'text/html' } })
		}

		if (path.startsWith('/unsplash')) {
			return await unsplash(req.url, env.UNSPLASH ?? '', headers)
		}

		if (path.startsWith('/weather')) {
			return await weather(req, ctx, env.WEATHER ?? '', headers)
		}

		if (path.startsWith('/suggestions')) {
			return await suggestions.fetch(req)
		}

		if (path.startsWith('/favicon')) {
			return await favicon.fetch(req)
		}

		if (path.startsWith('/quotes')) {
			return await quotes.fetch(req, env, ctx)
		}

		return new Response('404 Not found', { status: 404, headers })
	},
}
