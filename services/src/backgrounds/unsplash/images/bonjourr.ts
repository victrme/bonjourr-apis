import type { Backgrounds } from '../../../types/backgrounds'
import type { Env } from '../../..'

export const UNSPLASH_COLLECTIONS = {
	// Daylight
	'daylight-images-night': 'bHDh4Ae7O8o',
	'daylight-images-noon': 'GD4aOSg4yQE',
	'daylight-images-day': 'o8uX55RbBPs',
	'daylight-images-evening': '3M2rKTckZaQ',

	// Seasons
	'seasons-images-winter': 'u0Kne8mFCQM',
}

export { unsplashImagesDaylight, unsplashImagesDaylightStore }

//  Get from storage

async function unsplashImagesDaylight(env: Env, headers: Headers): Promise<Response> {
	const result: Record<string, Backgrounds.Image[]> = {
		'daylight-images-night': [],
		'daylight-images-noon': [],
		'daylight-images-day': [],
		'daylight-images-evening': [],
	}

	for (const collection of Object.keys(result)) {
		const storage: Backgrounds.API.UnsplashImage[] = await env.UNSPLASH_KV.get(
			collection,
			'json'
		)

		for (let i = 0; i < 10; i++) {
			const random = Math.floor(Math.random() * storage.length)
			const item = storage[random]

			result[collection].push({
				format: 'image',
				urls: {
					full: item.urls.raw,
					medium: item.urls.regular,
					small: item.urls.small,
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
	const promises = Object.entries(UNSPLASH_COLLECTIONS).map(([name, id]) =>
		storeCollection(name, id, env)
	)

	await Promise.all(promises)
}

async function storeCollection(name: string, id: string, env: Env): Promise<void> {
	const result: unknown[] = []

	for (let page = 1; page < 100; page++) {
		const pageImages = await retrieveCollectionPage(id, page, env)
		const isLastPage = pageImages.length < 30

		result.push(...pageImages)

		if (isLastPage) {
			continue
		}
	}

	try {
		await env.UNSPLASH_KV.put(name, JSON.stringify(result))
		console.log('Saved', name)
	} catch (e) {
		console.log(e.message)
	}
}

async function retrieveCollectionPage(collection: string, page: number, env: Env) {
	const Authorization = 'Client-ID ' + env.UNSPLASH
	const headers = { 'Accept-Version': 'v1', Authorization }
	const path = `https://api.unsplash.com/collections/${collection}/photos?per_page=30&page=${page}`
	const resp = await fetch(path, { headers })
	const json = await resp.json()

	return json
}
