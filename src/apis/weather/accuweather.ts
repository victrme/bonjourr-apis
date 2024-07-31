import { getCoordsFromIp } from './weather'
import { geocodingAPI } from './openweathermap'

//@ts-expect-error
import scraper from '../accuweather'

import type * as Worker from '@cloudflare/workers-types'
import type { ExtendedOnecall, Geo } from '../../types/weather'

export async function accuweather(
	req: Worker.Request,
	ctx: ExecutionContext,
	key: string,
): Promise<ExtendedOnecall> {
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

	// Transform id from Accuweather to OpenWeatherMap
	let owmIconId = 801
	for (const { accu, owm } of Object.values(weatherConditions)) {
		if (accu.includes(json.now.icon)) {
			owmIconId = owm
		}
	}

	const result: ExtendedOnecall = {
		city: city ? city : undefined,
		ccode: ccode ? ccode : undefined,
		lat: json.lat,
		lon: json.lon,
		link: json.link,
		current: {
			dt: Math.floor(Date.now() / 1000),
			temp: json.now.temp,
			feels_like: json.now.feels,
			sunrise: json.sun.rise / 1000,
			sunset: json.sun.set / 1000,
			weather: [
				{
					id: owmIconId,
					icon: owmIconId.toString(),
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

const weatherConditions = {
	clearsky: {
		accu: [1, 2, 33, 34],
		owm: 800,
	},
	fewclouds: {
		accu: [3, 4, 5, 30, 31, 35, 36, 37],
		owm: 801,
	},
	brokenclouds: {
		accu: [6, 7],
		owm: 802,
	},
	overcastclouds: {
		accu: [8, 38],
		owm: 803,
	},
	lightrain: {
		accu: [14, 26, 29, 39],
		owm: 500,
	},
	lightdrizzle: {
		accu: [39],
		owm: 300,
	},
	showerdrizzle: {
		accu: [13],
		owm: 312,
	},
	showerrain: {
		accu: [12, 33, 34],
		owm: 504,
	},
	thunderstorm: {
		accu: [15, 16, 17, 41, 42],
		owm: 200,
	},
	snow: {
		accu: [19, 20, 21, 22, 23, 24, 25, 43, 44],
		owm: 600,
	},
	mist: {
		accu: [11],
		owm: 701,
	},
}
