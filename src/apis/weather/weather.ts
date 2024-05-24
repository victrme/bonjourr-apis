import { openweathermap } from './openweathermap'
import { accuweather } from './accuweather'

import type * as Worker from '@cloudflare/workers-types'
import { Geo } from '../../types/weather'

export default async function weather(
	req: Worker.Request,
	ctx: ExecutionContext,
	owmkeys: string,
	headers: Headers,
) {
	const url = new URL(req.url)

	// Validate parameters

	const validParams = ['q', 'lat', 'lon', 'units', 'lang', 'mode', 'provider']
	const requestParams = [...url.searchParams.keys()]
	let hasInvalidParams = false

	for (const param of requestParams) {
		if (validParams.includes(param) === false) {
			hasInvalidParams = true
		}
	}

	if (hasInvalidParams) {
		return new Response(JSON.stringify({ error: 'Invalid queries' }), {
			status: 400,
			headers,
		})
	}

	// Fetch weather infos

	const keylist = owmkeys.split(',')
	const key = keylist[Math.floor(Math.random() * keylist.length)]
	const provider = url.searchParams.get('provider') ?? 'accuweather'
	let json: unknown

	if (provider === 'accuweather') json = await accuweather(req, ctx, key)
	if (provider === 'openweathermap') json = await openweathermap(req, ctx, key)

	headers.set('Content-Type', 'application/json')
	headers.set('Cache-Control', 'public, max-age=1800')

	if (json) {
		return new Response(JSON.stringify(json), { headers })
	}

	return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
}

// Cloudflare Workers specifics

export function getCoordsFromIp(req: Worker.Request): Geo {
	if (req?.cf) {
		return {
			lat: parseFloat(req.cf?.latitude as string),
			lon: parseFloat(req.cf?.longitude as string),
			name: req.cf?.city as string,
			country: req.cf?.country as string,
		}
	}

	return { lat: 0, lon: 0, name: '', country: '' }
}

export async function cacheControl(
	ctx: Worker.ExecutionContext,
	url: string,
	key: string,
	maxage = 1800,
): Promise<Worker.Response> {
	const cacheKey = new Request(url)
	const cache = caches.default
	let response = await cache.match(cacheKey)

	if (!response) {
		response = (await fetch(url + `&appid=${key}`)) as any
		response = new Response(response?.body, response)
		response.headers.append('Cache-Control', 's-maxage=' + maxage)
		ctx.waitUntil(cache.put(cacheKey, response.clone()))
	}

	//@ts-expect-error
	return response
}
