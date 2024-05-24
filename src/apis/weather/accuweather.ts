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

	let geo: Geo = { lat: 0, lon: 0, name: '', country: '' }
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
		city: city,
		ccode: ccode,
		lat: json.lat,
		lon: json.lon,
		current: {
			dt: Date.now() / 1000,
			temp: json.now.temp,
			feels_like: json.now.feels,
			sunrise: json.sun.rise,
			sunset: json.sun.set,
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
			dt: item.timestamp,
			temp: item.temp,
			feels_like: item.temp,
			weather: [{ description: '', icon: '', id: 0, main: '' }],
		})),
	}

	return result
}

namespace AccuWeather {
	export interface Data {
		lat: number
		lon: number
		city: string
		region: string
		link: string
		now: Now
		sun: Sun
		today?: Today
		hourly: Hourly[]
		daily: Daily[]
	}

	export type Today = {
		day: string
		night: string
		high: number
		low: number
	}

	export type Now = {
		icon: number
		temp: number
		feels: number
		description: string
	}

	export type Sun = {
		duration: string
		rise: number
		set: number
	}

	export type Hourly = {
		timestamp: number
		temp: number
		rain: string
	}

	export type Daily = {
		timestamp: number
		high: number
		low: number
		day: string
		night: string
		rain: string
	}
}
