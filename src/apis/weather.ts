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
}

export default async function weather(req: Request, ctx: ExecutionContext, keys: string, headers: Headers) {
	const hasLocation = req.url.includes('lat=') && req.url.includes('lon=')
	const base = 'https://api.openweathermap.org/data/2.5/'
	const url = new URL(req.url)

	const keylist = keys.split(',')
	const key = keylist[Math.floor(Math.random() * keylist.length)]

	headers.set('Content-Type', 'application/json')
	headers.set('Cache-Control', 'public, max-age=1800')

	const validParams = ['q', 'lat', 'lon', 'units', 'lang', 'mode']
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

	switch (url.pathname) {
		case '/weather/current':
		case '/weather/current/':
			return await getWeatherData('current')

		case '/weather/forecast':
		case '/weather/forecast/':
			return await getWeatherData('forecast')

		case '/weather/':
		case '/weather':
			return await createOnecallData()

		default:
			return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
	}

	//
	//
	//

	async function getWeatherData(type: 'current' | 'forecast'): Promise<Response> {
		let params = url.search

		if (!params.includes('q=') && !params.includes('lon=')) {
			const { lat, lon } = getCoordsFromIp()
			params += `&lat=${lat}&lon=${lon}`
		}

		if (type === 'forecast') {
			params += '&cnt=14'
		}

		const path = type === 'forecast' ? 'forecast' : 'weather'
		const currentResponse = await cacheControl(ctx, base + path + params, key)

		if (currentResponse.status === 200) {
			return new Response(JSON.stringify(await currentResponse.json()), {
				status: currentResponse.status,
				headers,
			})
		}

		return new Response('{}', { status: currentResponse.status, headers })
	}

	async function createOnecallData(): Promise<Response> {
		let city = ''
		let ccode = ''
		let params = url.search

		if (!hasLocation) {
			let geo = { lat: 0, lon: 0, name: '', country: '' }

			if (params.includes('q=')) {
				geo = await getCoordsFromCityQuery(key, url.search)
				params = params.slice(0, params.indexOf(params.includes('&q=') ? '&q=' : 'q=')) // no "&" if first param
			}

			if (geo.lat === 0 && geo.lon === 0) {
				geo = getCoordsFromIp()
				city = geo.name
				ccode = geo.country
			}

			params += `${params.includes('?') ? '&' : '?'}lat=${geo.lat}&lon=${geo.lon}`
		}

		const currentResponse = await cacheControl(ctx, `${base}weather${params}`, key)
		const forecastResponse = await cacheControl(ctx, `${base}forecast${params}&cnt=14`, key)

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

			return new Response(JSON.stringify(onecall), { status: 200, headers })
		}

		return new Response('{}', { status: currentResponse.status, headers })
	}

	function getCoordsFromIp(): Geo {
		if (req?.cf) {
			return {
				lat: parseFloat(req.cf?.latitude as string),
				lon: parseFloat(req.cf?.longitude as string),
				name: req.cf?.country as string,
				country: req.cf?.city as string,
			}
		}

		return { lat: 0, lon: 0, name: '', country: '' }
	}

	async function getCoordsFromCityQuery(key: string, search: string): Promise<Geo> {
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
}

async function cacheControl(ctx: ExecutionContext, url: string, key: string, maxage = 1800): Promise<Response> {
	const cacheKey = new Request(url)
	const cache = caches.default
	let response = await cache.match(cacheKey)

	if (!response) {
		response = await fetch(url + `&appid=${key}`)
		response = new Response(response.body, response)
		response.headers.append('Cache-Control', 's-maxage=' + maxage)
		ctx.waitUntil(cache.put(cacheKey, response.clone()))
	}

	return response
}
