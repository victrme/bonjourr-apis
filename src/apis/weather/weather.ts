import { getWeatherData, createOnecallData } from './openweathermap'
import accuweather from './accuweather'

export default async function weather(req: Request, ctx: ExecutionContext, keys: string, headers: Headers) {
	const url = new URL(req.url)
	const keylist = keys.split(',')
	const key = keylist[Math.floor(Math.random() * keylist.length)]

	headers.set('Content-Type', 'application/json')
	headers.set('Cache-Control', 'public, max-age=1800')

	const validParams = ['q', 'lat', 'lon', 'units', 'lang', 'mode', 'provider']
	const requestParams = [...url.searchParams.keys()]
	let hasInvalidParams = false
	let json: any

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

	if (url.searchParams.get('provider') === 'accuweather') {
		return accuweather.fetch(req)
	}

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

	if (json) {
		return new Response(JSON.stringify(json), { headers })
	} else {
		return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
	}
}
