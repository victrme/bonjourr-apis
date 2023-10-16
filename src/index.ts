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

type ApiResponse = {
	status: number
	data?: JSON | any[] | string
}

export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url)
		const path = url.pathname

		let response: ApiResponse = {
			data: 'Not a correct path',
			status: 404,
		}

		//
		// Get data

		if (path.startsWith('/unsplash') && request.url.includes('?')) {
			response = await unsplash(request, env)
		}

		if (path.startsWith('/weather') && path.match(/current|forecast/) && request.url.includes('?')) {
			response = await weather(request, env)
		}

		if (path.startsWith('/quotes')) {
			response = await quotes(request)
		}

		if (path.startsWith('/favicon')) {
			response = { status: 200, data: await faviconFetcher(path.replace('/favicon/', '')) }
		}

		if (path.startsWith('/suggestions')) {
			response = { status: 200, data: await suggestions(request.url) }
		}

		//
		// Create Response

		if (typeof response?.data === 'object') {
			headers['Content-Type'] = 'application/json'
			response.data = JSON.stringify(response.data)
		}

		return new Response(response.data, {
			status: response.status,
			headers,
		})
	},
}

async function weather(request: Request, env: Env): Promise<ApiResponse> {
	const url = new URL(request.url)
	const key = env.WEATHER
	const path = url.pathname
	const params = request.url.split('?')[1]
	const pathname = path.includes('forecast') ? 'forecast' : 'weather'
	const fetchURL = `https://api.openweathermap.org/data/2.5/${pathname}?appid=${key}&${params}`
	const resp = await fetch(fetchURL)

	try {
		const json = await resp.json()
		return { status: resp.status, data: json }
		//
	} catch (error) {
		console.log(error)
		return { status: resp.status }
	}
}

async function unsplash(request: Request, env: Env): Promise<ApiResponse> {
	const params = request.url.split('?')[1]
	const fetchURL = `https://api.unsplash.com/photos/random?${params}`
	const fetchHeaders = { 'Accept-Version': 'v1', Authorization: `Client-ID ${env.UNSPLASH}` }
	const resp = await fetch(fetchURL, { headers: fetchHeaders })

	try {
		const json = (await resp.json()) as JSON
		return { status: resp.status, data: json }
		//
	} catch (error) {
		console.log(error)
		return { status: resp.status, data: [] }
	}
}

async function quotes(request: Request): Promise<ApiResponse> {
	const url = new URL(request.url)
	const path = url.pathname
	let response: ApiResponse = { status: 404 }

	if (path.startsWith('/quotes/classic')) {
		const lang = path.replace('/quotes/classic/', '')
		response = { status: 200, data: await classicQuotes(lang) }
	}

	if (path.startsWith('/quotes/kaamelott')) {
		response = { status: 200, data: await kaamelottQuotes() }
	}

	if (path.startsWith('/quotes/inspirobot')) {
		response = { status: 200, data: await inspirobotQuotes() }
	}

	return response
}
