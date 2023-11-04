import type { Request } from '@cloudflare/workers-types'

export default async function weather(req: Request, keys: string, headers: HeadersInit) {
	const hasLocation = req.url.includes('lat=') && req.url.includes('lon=')
	const base = 'https://api.openweathermap.org/data/2.5/'
	const key = keys.split(',')[0]

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

	const current = (await (await fetch(`${base}weather?appid=${key}&${params}`)).json()) as Current
	const forecast = (await (await fetch(`${base}forecast?appid=${key}&${params}&cnt=14`)).json()) as Forecast

	headers['content-type'] = 'application/json'

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

	return new Response(JSON.stringify(onecall), { status: 200, headers })
}

interface WeatherResponse extends Onecall {
	city?: string
	ccode?: string
}

type Onecall = {
	lat: number
	lon: number
	current: {
		dt: number
		sunrise: number
		sunset: number
		temp: number
		feels_like: number
		weather: WeatherInfos[]
	}
	hourly: {
		dt: number
		temp: number
		feels_like: number
		weather: WeatherInfos[]
	}[]
}

type Current = {
	name: string
	cod: number
	coord: {
		lon: number
		lat: number
	}
	weather: WeatherInfos[]
	main: {
		temp: number
		feels_like: number
	}
	dt: number
	sys: {
		country: string
		sunrise: number
		sunset: number
	}
}

type Forecast = {
	cod: string
	list: {
		dt: number
		main: {
			temp: number
			feels_like: number
		}
		weather: WeatherInfos[]
	}[]
}

type WeatherInfos = {
	id: number
	main: string
	description: string
	icon: string
}
