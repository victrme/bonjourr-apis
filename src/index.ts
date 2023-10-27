//@ts-ignore
import html from './index.html'
import { Fetcher, ExportedHandler } from '@cloudflare/workers-types'
import type * as Openweathermap from './types/openweathermap'

const headers = {
	'access-control-allow-origin': '*',
	'cache-control': 'public, maxage=3600',
}

interface Env {
	UNSPLASH: string
	WEATHER: string
	quotes: Fetcher
	favicon: Fetcher
	suggestions: Fetcher
}

export default <ExportedHandler<Env>>{
	async fetch(req, env) {
		const url = new URL(req.url)
		const path = url.pathname

		if (path === '/') {
			return new Response(html, { headers: { 'Content-Type': 'text/html' } })
		}

		if (path.startsWith('/unsplash')) {
			return await unsplash(req.url, env.UNSPLASH ?? '')
		}

		if (path.startsWith('/weather') && req.url.includes('?')) {
			return await weather(req.url, env.WEATHER ?? '')
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

		return new Response('404 Not found', { status: 404 })
	},
}

async function weather(requrl: string, key: string): Promise<Response> {
	const params = requrl.split('?')[1]
	const base = 'https://api.openweathermap.org/data/2.5/'

	const current = (await (await fetch(`${base}weather?appid=${key}&${params}`)).json()) as Openweathermap.Current
	const forecast = (await (await fetch(`${base}forecast?appid=${key}&${params}`)).json()) as Openweathermap.Forecast

	headers['Content-Type'] = 'application/json'

	const onecall: Openweathermap.Onecall = {
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

	headers['Content-Type'] = 'application/json'

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
