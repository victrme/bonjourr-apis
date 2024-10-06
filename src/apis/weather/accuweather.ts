//@ts-expect-error
import scraper from '../accuweather'
import { getCoordsFromIp } from './weather'
import { geocodingAPI } from './openweathermap'

import type * as Worker from '@cloudflare/workers-types'
import type { Weather, Geo } from '../../types/weather'

export async function accuweather(
	req: Worker.Request,
	ctx: ExecutionContext,
	key: string
): Promise<Weather> {
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

	const units = url.searchParams.get('units') === 'imperial' ? 'F' : 'C'
	const lang = url.searchParams.get('lang') ?? 'en'
	const params = `?lat=${geo.lat}&lon=${geo.lon}&unit=${units}&lang=${lang}`
	const request = new Request(url.origin + params)

	const response = (await scraper.fetch(request)) as Worker.Response
	const json = await response.json<AccuWeather.Data>()

	const result: Weather = {
		from: 'accuweather',
		city: city ? city : undefined,
		ccode: ccode ? ccode : undefined,
		lat: json.lat,
		lon: json.lon,
		link: json.link,
		current: {
			dt: Math.floor(Date.now() / 1000),
			temp: json.now.temp,
			feels_like: json.now.feels,
			sunrise: Math.floor(json.sun.rise / 1000),
			sunset: Math.floor(json.sun.set / 1000),
			weather: [
				{
					id: json.now.icon,
					icon: json.now.icon.toString(),
					main: json.now.description,
					description: json.now.description,
				},
			],
		},
		hourly: [
			{
				dt: Math.floor(json.daily[0].timestamp / 1000),
				temp: json.daily[0].high,
			},
			...json.hourly.map((item) => ({
				dt: Math.floor(item.timestamp / 1000),
				temp: item.temp,
			})),
			{
				dt: Math.floor(json.daily[1].timestamp / 1000),
				temp: json.daily[1].high,
			},
		],
	}

	return result
}
