//@ts-ignore
import html from './index.html'
import { Fetcher, Request } from '@cloudflare/workers-types'
import type * as Openweathermap from './types/openweathermap'

const headers = {
	'access-control-allow-origin': '*',
	'access-control-allow-headers': '*',
	'access-control-allow-methods': 'GET, OPTIONS',
	'access-control-max-age': '3600',
	'cache-control': 'public, maxage=3600',
}

interface Env {
	UNSPLASH?: string
	WEATHER?: string
	quotes: Fetcher
	favicon: Fetcher
	suggestions: Fetcher
}

export default {
	async fetch(req: Request, env: Env) {
		const url = new URL(req.url)
		const path = url.pathname

		if (path === '/') {
			return new Response(html, { headers: { ...headers, 'content-type': 'text/html' } })
		}

		if (path.startsWith('/unsplash')) {
			return await unsplash(req.url, env.UNSPLASH ?? '')
		}

		if (path.startsWith('/weather')) {
			return await weather(req, env.WEATHER ?? '')
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

		return new Response('404 Not found', { status: 404, headers })
	},
}

async function weather(req: Request, key: string): Promise<Response> {
	const hasLocation = req.url.includes('lat=') && req.url.includes('lon=')
	const base = 'https://api.openweathermap.org/data/2.5/'
	let params = req.url.split('?')[1] ?? ''
	let city = ''
	let ccode = ''

	if (!hasLocation) {
		const geo = { lat: 0, lon: 0 }

		// City,Country is available
		if (params.includes('q')) {
			const q = (params.split('&').filter((p) => p.includes('q='))[0] ?? '').replace('q=', '')
			const resp = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=1&appid=${key}`)
			const json = await resp.json()

			geo.lat = json.lat
			geo.lon = json.lon
			city = q?.split(',')[0] ?? ''
			ccode = q?.split(',')[1] ?? ''
		}

		// Approximate location from ip
		else if (req?.cf) {
			geo.lat = parseFloat(req.cf?.latitude as string)
			geo.lon = parseFloat(req.cf?.longitude as string)
			ccode = req.cf?.country as string
			city = req.cf?.city as string
		}

		params += `&lat=${geo.lat}&lon=${geo.lon}`
	}

	const current = (await (await fetch(`${base}weather?appid=${key}&${params}`)).json()) as Openweathermap.Current
	const forecast = (await (await fetch(`${base}forecast?appid=${key}&${params}&cnt=14`)).json()) as Openweathermap.Forecast

	headers['content-type'] = 'application/json'

	const onecall: Openweathermap.Onecall = {
		city: hasLocation ? undefined : city,
		ccode: hasLocation ? undefined : ccode,
		lat: current.coord.lat,
		lon: current.coord.lon,
		current: {
			dt: current.dt,
			temp: current.main.temp,
			feels_like: current.main.feels_like,
			sunrise: current.sys.sunrise,
			sunset: current.sys.sunset,
			weather: current.weather,
		},
		hourly: forecast.list.map((item) => ({
			dt: item.dt,
			temp: item.main.temp,
			weather: item.weather,
			feels_like: item.main.feels_like,
		})),
	}

	return new Response(JSON.stringify(onecall), { status: 200, headers })
}

async function unsplash(requrl: string, key: string): Promise<Response> {
	const endpoint = requrl.slice(requrl.indexOf('/unsplash') + 9)

	const resp = await fetch(`https://api.unsplash.com${endpoint}`, {
		headers: {
			'Accept-Version': 'v1',
			Authorization: `Client-ID ${key}`,
		},
	})

	headers['content-type'] = 'application/json'

	let result: unknown[] = []

	try {
		result = await resp.json()
	} catch (error) {
		console.log(error)
	}

	return new Response(JSON.stringify(result), {
		status: resp.status,
		headers,
	})
}
