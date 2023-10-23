import { Fetcher, ExportedHandler } from '@cloudflare/workers-types'
import html from './index.html'

const headers = {
	'access-control-allow-origin': '*',
	'cache-control': 'public, maxage=3600',
}

interface Env {
	UNSPLASH: string
	WEATHER: string
	quotes: any
	favicon: Fetcher
	suggestions: any
}

export default <ExportedHandler<Env>>{
	async fetch(req, env) {
		const url = new URL(req.url)
		const path = url.pathname

		if (path === '/') {
			return new Response(html, { headers: { 'Content-Type': 'text/html' } })
		}

		if (path.startsWith('/unsplash') && req.url.includes('?')) {
			return await unsplash(req.url, env)
		}

		if (path.startsWith('/weather') && path.match(/current|forecast/) && req.url.includes('?')) {
			return await weather(req.url, env)
		}

		if (path.startsWith('/favicon')) {
			return await env.favicon.fetch(req)
		}

		if (path.startsWith('/quotes')) {
			return await env.quotes.fetch(req)
		}

		if (path.startsWith('/suggestions')) {
			return await env.suggestions.fetch(req)
		}

		return new Response('Invalid path', { status: 404 })
	},
}

async function weather(requrl: string, env: Env): Promise<Response> {
	const key = env.WEATHER
	const url = new URL(requrl)
	const path = url.pathname
	const params = requrl.split('?')[1]
	const pathname = path.includes('forecast') ? 'forecast' : 'weather'
	const fetchURL = `https://api.openweathermap.org/data/2.5/${pathname}?appid=${key}&${params}`
	const resp = await fetch(fetchURL)

	headers['Content-Type'] = 'application/json'

	try {
		const json = await resp.json()
		return new Response(JSON.stringify(json), { status: resp.status, headers })
		//
	} catch (error) {
		console.log(error)
		return new Response(JSON.stringify({ error }), { status: resp.status, headers })
	}
}

async function unsplash(url: string, env: Env): Promise<Response> {
	const params = url.split('?')[1]
	const fetchURL = `https://api.unsplash.com/photos/random?${params}`
	const fetchHeaders = { 'Accept-Version': 'v1', Authorization: `Client-ID ${env.UNSPLASH}` }
	const resp = await fetch(fetchURL, { headers: fetchHeaders })

	headers['Content-Type'] = 'application/json'

	try {
		const json = (await resp.json()) as JSON
		return new Response(JSON.stringify(json), { status: resp.status, headers })
		//
	} catch (error) {
		console.log(error)
		return new Response(JSON.stringify([]), { status: resp.status, headers })
	}
}
