//@ts-expect-error
import meteo from './meteo/src/index.js'

export default async function weather(req: Request, headers: Headers) {
	const url = new URL(req.url)
	let response

	if (url.searchParams.get('lang')) {
		url.searchParams.set('lang', sanitizeLang(url.searchParams.get('lang') ?? 'en'))
	}
	if (url.searchParams.get('q')) {
		url.searchParams.set('query', url.searchParams.get('q') ?? '')
	}
	if (url.searchParams.get('units')) {
		url.searchParams.set('unit', url.searchParams.get('units') === 'imperial' ? 'F' : 'C')
	}
	if (!url.searchParams.get('provider')) {
		url.searchParams.set('provider', 'accuweather')
	}

	try {
		const request = new Request(url.origin + url.search, { cf: req.cf })
		response = await meteo.fetch(request)
	} catch (error) {
		return new Response(JSON.stringify(error), {
			status: 429,
			headers,
		})
	}

	const json = await response.json()

	const result = {
		from: url.searchParams.get('provider') === 'foreca' ? 'foreca' : 'accuweather',
		city: json.geo.city,
		ccode: json.geo.country,
		lat: json.geo.lat,
		lon: json.geo.lon,
		link: json.meta.link,
		current: {
			temp: json.now.temp,
			feels_like: json.now.feels,
			sunrise: Math.floor(hourAndMinToUnixTime(json.sun.rise[0], json.sun.rise[1]) / 1000),
			sunset: Math.floor(hourAndMinToUnixTime(json.sun.set[0], json.sun.set[1]) / 1000),
			weather: [
				{
					id: json.now.icon,
					description: json.now.description,
				},
			],
		},
		hourly: [
			{
				dt: Math.floor(new Date(json.daily[0].time).getTime() / 1000),
				temp: json.daily[0].high,
			},
			{
				dt: Math.floor(new Date(json.daily[1].time).getTime() / 1000),
				temp: json.daily[1].high,
			},
		],
	}

	headers.set('Content-Type', 'application/json')
	headers.set('Cache-Control', 'public, max-age=1800')

	if (result) {
		return new Response(JSON.stringify(result), {
			headers,
		})
	} else {
		return new Response(JSON.stringify({ error: 'Not found' }), {
			status: 404,
			headers,
		})
	}
}

function hourAndMinToUnixTime(hour: number, minutes: number): number {
	const addZero = (str: string) => (str.length === 1 ? '0' + str : str)
	const ISO = new Date().toISOString()
	const date = ISO.split('T')[0]
	const time = `${addZero(hour.toString())}:${addZero(minutes.toString())}:00.000Z`

	return new Date(`${date}T${time}`).getTime()
}

function sanitizeLang(lang: string): string {
	// https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
	if (lang === 'jp') lang = 'ja'
	if (lang === 'cz') lang = 'cs'
	if (lang === 'gr') lang = 'el'
	if (lang === 'es-ES') lang = 'es'
	if (lang === 'es_ES') lang = 'es'
	if (lang === 'pt_BR') lang = 'pt-BR'
	if (lang === 'zh_CN') lang = 'zh-CN'
	if (lang === 'zh_HK') lang = 'zh-HK'
	if (lang === 'zh_TW') lang = 'zh-TW'

	return lang
}

// export async function cacheControl(
// 	ctx: Worker.ExecutionContext,
// 	url: string,
// 	key: string,
// 	maxage = 1800
// ): Promise<Worker.Response> {
// 	const cacheKey = new Request(url)
// 	const cache = caches.default
// 	let response = await cache.match(cacheKey)

// 	if (!response) {
// 		response = (await fetch(url + `&appid=${key}`)) as any
// 		response = new Response(response?.body, response)
// 		response.headers.append('Cache-Control', 's-maxage=' + maxage)
// 		ctx.waitUntil(cache.put(cacheKey, response.clone()))
// 	}

// 	return response
// }
