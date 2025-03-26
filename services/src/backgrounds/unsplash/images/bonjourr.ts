import type { Backgrounds } from '../../../../../types/backgrounds'
import type { Env } from '../../..'

export const UNSPLASH_COLLECTIONS = {
	// Daylight
	'bonjourr-images-daylight-night': 'bHDh4Ae7O8o',
	'bonjourr-images-daylight-noon': 'GD4aOSg4yQE',
	'bonjourr-images-daylight-day': 'o8uX55RbBPs',
	'bonjourr-images-daylight-evening': '3M2rKTckZaQ',

	// Seasons
	'bonjourr-images-seasons-winter': 'u0Kne8mFCQM',
}

export { unsplashImagesDaylight, unsplashImagesDaylightStore }

//  Get from storage

async function unsplashImagesDaylight(url: URL, env: Env, headers: Headers): Promise<Response> {
	const result: Record<string, Backgrounds.Image[]> = {
		'bonjourr-images-daylight-night': [],
		'bonjourr-images-daylight-noon': [],
		'bonjourr-images-daylight-day': [],
		'bonjourr-images-daylight-evening': [],
	}

	const h = Number.parseInt(url.searchParams.get('h') ?? '1080')
	const w = Number.parseInt(url.searchParams.get('w') ?? '1920')

	for (const collection of Object.keys(result)) {
		const randomStatement = `SELECT data FROM "${collection}" ORDER BY RANDOM() LIMIT 10`
		const { results } = await env.DB.prepare(randomStatement).all()

		if (results.length === 0) {
			continue
		}

		for (const row of results) {
			const data = row.data as string
			const item: Backgrounds.API.UnsplashImage = JSON.parse(data)
			const baseImgUrl = `${item.urls.raw}&auto=format&fit=crop&crop=entropy`
			const paramsFull = `&h=${h}&w=${w}&q=80`
			const paramsMedium = `&h=${Math.round(h / 3)}&w=${Math.round(w / 3)}&q=60`
			const paramsSmall = `&h=${Math.round(h / 10)}&w=${Math.round(w / 10)}&q=60`

			result[collection].push({
				format: 'image',
				urls: {
					full: baseImgUrl + paramsFull,
					medium: baseImgUrl + paramsMedium,
					small: baseImgUrl + paramsSmall,
				},
				page: item.links.html,
				download: item.links.download,
				username: item.user.username,
				name: item.user.name,
				city: item?.location?.city || undefined,
				country: item?.location?.country || undefined,
				color: item.color,
				exif: item.exif,
			})
		}
	}

	return new Response(JSON.stringify(result), { headers })
}

//  Save to storage

async function unsplashImagesDaylightStore(env: Env) {
	const entries = Object.entries(UNSPLASH_COLLECTIONS)
	const storeActions = entries.map(([name, id]) => storeSingleCollection(name, id, env))
	await Promise.all(storeActions)
}

async function storeSingleCollection(name: string, id: string, env: Env): Promise<void> {
	const createStatement = `
		CREATE TABLE IF NOT EXISTS "${name}" (
			url TEXT PRIMARY KEY,
			data JSON NOT NULL
		);
	`

	await env.DB.prepare(createStatement).run()
	const images: Backgrounds.API.UnsplashImage[] = []

	for (let page = 1; page < 100; page++) {
		const pageImages = await retrieveCollectionPage(id, page, env)
		images.push(...pageImages)
	}

	try {
		for (const image of images) {
			const url = image.urls.raw
			const data = JSON.stringify(image)
			const insertStatement = `INSERT INTO "${name}" (url, data) VALUES (?, ?)`
			await env.DB.prepare(insertStatement).bind(url, data).run()
		}

		console.warn("Stored ", name)
	} catch (e) {
		console.warn(e.message)
	}
}

async function retrieveCollectionPage(
	collection: string,
	page: number,
	env: Env,
): Promise<Backgrounds.API.UnsplashImage[]> {
	const Authorization = `Client-ID ${env.UNSPLASH}`
	const headers = { 'Accept-Version': 'v1', Authorization }
	const path = `https://api.unsplash.com/collections/${collection}/photos?per_page=30&page=${page}`
	const resp = await fetch(path, { headers })
	const json = await resp.json()

	return json
}
