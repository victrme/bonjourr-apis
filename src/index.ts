//@ts-ignore
import html from './index.html'
import weather from './apis/weather'
import unsplash from './apis/unsplash'
import suggestions from './apis/suggestions/src/worker'

const headers = new Headers({
	'access-control-allow-origin': '*',
	'access-control-allow-headers': '*',
	'access-control-allow-methods': 'GET, OPTIONS',
	'access-control-max-age': '3600',
	'cache-control': 'public, maxage=3600',
})

interface Env {
	UNSPLASH?: string
	WEATHER?: string
	quotes: Fetcher
	favicon: Fetcher
}

export default {
	async fetch(req: Request, env: Env) {
		const url = new URL(req.url)
		const path = url.pathname

		if (path === '/') {
			return new Response(html, { headers: { ...headers, 'content-type': 'text/html' } })
		}

		if (path.startsWith('/unsplash')) {
			return await unsplash(req.url, env.UNSPLASH ?? '', headers)
		}

		if (path.startsWith('/weather')) {
			return await weather(req, env.WEATHER ?? '', headers)
		}

		if (path.startsWith('/suggestions')) {
			return await suggestions.fetch(req)
		}

		if (path.startsWith('/favicon')) {
			return await env.favicon.fetch(req)
		}

		if (path.startsWith('/quotes')) {
			return await env.quotes.fetch(req)
		}

		return new Response('404 Not found', { status: 404, headers })
	},
}
