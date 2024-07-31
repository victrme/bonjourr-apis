import { cacheControl, getCoordsFromIp } from './weather'

import type * as Worker from '@cloudflare/workers-types'
import type { WeatherResponse, Current, Forecast, Geo } from '../../types/weather'

export async function openweathermap(req: Worker.Request, ctx: Worker.ExecutionContext, key: string) {
	const url = new URL(req.url)
	let json: Current | Forecast | WeatherResponse | undefined

	switch (url.pathname) {
		case '/weather/current':
		case '/weather/current/':
			json = await getWeatherData('current', key, req, ctx)

		case '/weather/forecast':
		case '/weather/forecast/':
			json = await getWeatherData('forecast', key, req, ctx)

		case '/weather/':
		case '/weather':
			json = await createOnecallData(key, req, ctx)
	}

	return json
}

export async function getWeatherData(
	type: 'current' | 'forecast',
	key: string,
	req: Worker.Request,
	ctx: Worker.ExecutionContext,
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
	req: Worker.Request,
	ctx: Worker.ExecutionContext,
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
			geo = await geocodingAPI(key, url.search, ctx)
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

export async function geocodingAPI(key: string, search: string, ctx: Worker.ExecutionContext): Promise<Geo> {
	const q = (search.split('&').filter((p) => p.includes('q='))[0] ?? '').replace('q=', '')
	const url = `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=1`
	const resp = await cacheControl(ctx, url, key, 31536000)
	const json: Geo[] = (await resp.json()) as Geo[]

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
