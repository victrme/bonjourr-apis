import proxy from './proxy.ts'
import fonts from './fonts.ts'
import unsplash from './unsplash.ts'
import backgrounds from './backgrounds.ts'

import quotes from './quotes/src/index.ts'
import favicon from './favicon/package/src/index.ts'
import suggestions from './suggestions/cloudflare/index.ts'

const headers = new Headers({
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Max-Age': '3600',
})

export interface Env {
	PIXABAY_COLLECTIONS?: string
	UNSPLASH?: string
	PIXABAY?: string
	UNSPLASH_KV?: unknown
	PIXABAY_KV?: unknown
}

export default {
	async fetch(req: Request, env: Env) {
		const url = new URL(req.url)
		const path = url.pathname.split('/')[1] ?? ''

		switch (path) {
			case 'unsplash':
				return await unsplash(req.url, env.UNSPLASH ?? '', headers)

			case 'proxy':
				return await proxy(req, headers)

			case 'fonts':
				return await fonts(headers)

			case 'suggestions':
				return await suggestions.fetch(req)

			case 'favicon':
				return await favicon.fetch(req)

			case 'quotes':
				return await quotes.fetch(req)

			case 'backgrounds':
				return await backgrounds(url, env, headers)

			case '': {
				headers.set('Content-Type', 'text/html')
				return new Response("Hello world, this is Bonjourr's services !", { headers })
			}

			default:
				return new Response('Not found', {
					status: 404,
					headers,
				})
		}
	},
}
