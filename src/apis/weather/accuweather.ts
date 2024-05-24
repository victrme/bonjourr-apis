import { getCoordsFromIp } from './weather'
import { geocodingAPI } from './openweathermap'

//@ts-expect-error
import scraper from '../accuweather'

import type * as Worker from '@cloudflare/workers-types'
import type { WeatherResponse, Geo } from '../../types/weather'

export async function accuweather(
	req: Worker.Request,
	ctx: ExecutionContext,
	key: string,
): Promise<WeatherResponse> {
	const url = new URL(req.url)
	const lat = parseFloat(url.searchParams.get('lat') ?? '0')
	const lon = parseFloat(url.searchParams.get('lon') ?? '0')

	let geo: Geo = { lat, lon, name: '', country: '' }
	let city = ''
	let ccode = ''

	if (url.search.includes('q=')) {
		geo = await geocodingAPI(key, url.search, ctx)
		city = geo.name
		ccode = geo.country
	}

	if (geo.lat === 0 && geo.lon === 0) {
		geo = getCoordsFromIp(req)
		city = geo.name
		ccode = geo.country
	}

	const unit = url.searchParams.get('unit') === 'imperial' ? 'F' : 'C'
	const lang = url.searchParams.get('lang') ?? 'en'
	const params = `?lat=${geo.lat}&lon=${geo.lon}&unit=${unit}&lang=${lang}`
	const request = new Request(url.origin + params)

	const response = (await scraper.fetch(request)) as Worker.Response
	const json = await response.json<AccuWeather.Data>()

	const result: WeatherResponse = {
		city: city ? city : undefined,
		ccode: ccode ? ccode : undefined,
		lat: json.lat,
		lon: json.lon,
		current: {
			dt: Math.floor(Date.now() / 1000),
			temp: json.now.temp,
			feels_like: json.now.feels,
			sunrise: json.sun.rise / 1000,
			sunset: json.sun.set / 1000,
			weather: [
				{
					id: json.now.icon,
					icon: json.now.icon + '',
					main: json.now.description,
					description: json.now.description,
				},
			],
		},
		hourly: json.hourly.map((item) => ({
			dt: item.timestamp / 1000,
			temp: item.temp,
		})),
	}

	return result
}
