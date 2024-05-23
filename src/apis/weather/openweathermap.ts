import type { Onecall, Current, Forecast, Geo } from '../../types/weather'

interface WeatherResponse extends Onecall {
	city?: string
	ccode?: string
}

export async function getWeatherData(
	type: 'current' | 'forecast',
	key: string,
	req: Request,
	ctx: ExecutionContext,
): Promise<Current | Forecast | undefined> {
	const base = 'https://api.openweathermap.org/data/2.5/'
	const url = new URL(req.url)

	let params = url.search

	if (!params.includes('q=') && !params.includes('lon=')) {
		const { lat, lon } = getCoordsFromIp(req)
		params += `&lat=${lat}&lon=${lon}`
	}

	if (type === 'forecast') {
		params += '&cnt=14'
	}

	const path = type === 'forecast' ? 'forecast' : 'weather'
	const currentResponse = await cacheControl(ctx, base + path + params, key)

	if (currentResponse.status === 200) {
		return await currentResponse.json()
	}
}

export async function createOnecallData(
	key: string,
	req: Request,
	ctx: ExecutionContext,
): Promise<WeatherResponse | undefined> {
	const hasLocation = req.url.includes('lat=') && req.url.includes('lon=')
	const base = 'https://api.openweathermap.org/data/2.5/'
	const url = new URL(req.url)

	let city = ''
	let ccode = ''
	let params = url.search

	if (!hasLocation) {
		let geo = { lat: 0, lon: 0, name: '', country: '' }

		if (params.includes('q=')) {
			geo = await getCoordsFromCityQuery(key, url.search, ctx)
			params = params.slice(0, params.indexOf(params.includes('&q=') ? '&q=' : 'q=')) // no "&" if first param
		}

		if (geo.lat === 0 && geo.lon === 0) {
			geo = getCoordsFromIp(req)
			city = geo.name
			ccode = geo.country
		}

		params += `${params.includes('?') ? '&' : '?'}lat=${geo.lat}&lon=${geo.lon}`
	}

	const responses = await Promise.all([
		cacheControl(ctx, `${base}weather${params}`, key),
		cacheControl(ctx, `${base}forecast${params}&cnt=14`, key),
	])

	if (responses[0].ok && responses[1].ok) {
		const current = (await responses[0].json()) as Current
		const forecast = (await responses[1].json()) as Forecast

		const onecall: WeatherResponse = {
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

		return onecall
	}
}

export async function getCoordsFromCityQuery(key: string, search: string, ctx: ExecutionContext): Promise<Geo> {
	const q = (search.split('&').filter((p) => p.includes('q='))[0] ?? '').replace('q=', '')
	const url = `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=1`
	const resp = await cacheControl(ctx, url, key, 31536000)
	const json = await resp.json<Geo[]>()

	if (json[0]) {
		return {
			lat: json[0].lat,
			lon: json[0].lon,
			name: q?.split(',')[0],
			country: q?.split(',')[1] ?? '',
		}
	}

	return { lat: 0, lon: 0, name: '', country: '' }
}

export function getCoordsFromIp(req: Request): Geo {
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

//

async function cacheControl(ctx: ExecutionContext, url: string, key: string, maxage = 1800): Promise<Response> {
	const cacheKey = new Request(url)
	const cache = caches.default
	let response = await cache.match(cacheKey)

	if (!response) {
		response = (await fetch(url + `&appid=${key}`)) as any
		response = new Response(response?.body, response)
		response.headers.append('Cache-Control', 's-maxage=' + maxage)
		ctx.waitUntil(cache.put(cacheKey, response.clone()))
	}

	return response
}
