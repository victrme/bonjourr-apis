export default async function weather(req: Request, ctx: ExecutionContext, keys: string, headers: Headers) {
	const hasLocation = req.url.includes('lat=') && req.url.includes('lon=')
	const base = 'https://api.openweathermap.org/data/2.5/'

	const keylist = keys.split(',')
	const key = keylist[Math.floor(Math.random() * keylist.length)]

	headers.set('content-type', 'application/json')

	let params = req.url.split('?')[1] ?? ''
	let city = ''
	let ccode = ''

	if (!hasLocation) {
		const geo = { lat: 0, lon: 0 }

		// City,Country is available
		if (params.includes('q')) {
			const q = (params.split('&').filter((p) => p.includes('q='))[0] ?? '').replace('q=', '')
			const resp = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=1&appid=${key}`)
			const json = await resp.json<Geo>()

			if (json[0]) {
				geo.lat = json[0].lat
				geo.lon = json[0].lon
				city = q?.split(',')[0] ?? ''
				ccode = q?.split(',')[1] ?? ''
			}

			params = params.slice(0, params.indexOf(params.includes('&q=') ? '&q=' : 'q=')) // no "&" if first param
		}

		// Approximate location from ip
		if (req?.cf && geo.lat === 0 && geo.lon === 0) {
			geo.lat = parseFloat(req.cf?.latitude as string)
			geo.lon = parseFloat(req.cf?.longitude as string)
			ccode = req.cf?.country as string
			city = req.cf?.city as string
		}

		params += `&lat=${geo.lat}&lon=${geo.lon}`
	}

	const currentResponse = await cacheControl(ctx, `${base}weather?${params}`, key)
	const forecastResponse = await cacheControl(ctx, `${base}forecast?${params}&cnt=14`, key)

	const isAllOk = currentResponse.status === 200 && forecastResponse.status === 200

	if (isAllOk) {
		const current = await currentResponse.json<Current>()
		const forecast = await forecastResponse.json<Forecast>()

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

		return new Response(JSON.stringify(onecall), {
			status: 200,
			headers,
		})
	}

	let error = 'Could not get weather data'
	if (currentResponse.status === 429) error = 'Account blocked'
	if (currentResponse.status === 401) error = 'Invalid API key'

	return new Response(JSON.stringify({ error }), {
		status: currentResponse.status,
		headers,
	})
}

async function cacheControl(ctx: ExecutionContext, url: string, key: string): Promise<Response> {
	const cacheKey = new Request(url)
	const cache = caches.default
	let response = await cache.match(cacheKey)

	if (response) {
		console.log(`Cache hit for: ${url}.`)
		return response
	}

	console.log(`Response for request not present in cache. Fetching and caching request.`)

	response = await fetch(url + `&appid=${key}`)
	response = new Response(response.body, response)
	response.headers.append('Cache-Control', 's-maxage=1200')

	ctx.waitUntil(cache.put(cacheKey, response.clone()))

	return response
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

type Geo = {
	name: string
	lat: number
	lon: number
	country: string
}[]
