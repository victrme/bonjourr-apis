import { toBonjourrImages } from '../shared.ts'

import type { Image, UnsplashImage } from '../../../../types/backgrounds.ts'
import type { Env } from '../../../index.ts'

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

//  Save to storage

async function unsplashImagesDaylightStore(env: Env) {
	const entries = Object.entries(UNSPLASH_COLLECTIONS)
	const storeActions = entries.map(([name, id]) => storeSingleCollection(name, id, env))
	await Promise.all(storeActions)
}

async function retrievePhotosDataFromIds(ids: string[], env: Env): Promise<UnsplashImage[]> {
	const Authorization = `Client-ID ${env.UNSPLASH}`
	const headers = { 'Accept-Version': 'v1', Authorization }
	const result: UnsplashImage[] = []

	const promises = ids.map(async (id) => {
		try {
			const path = `https://api.unsplash.com/photos/${id}`
			const resp = await fetch(path, { headers })
			const json = (await resp.json()) as UnsplashImage
			result.push(json)
		} catch (error) {
			console.warn(error)
		}
	})

	await Promise.all(promises)

	return result
}

async function retrievePhotosIdsFromCollection(collection: string, env: Env): Promise<string[]> {
	const Authorization = `Client-ID ${env.UNSPLASH}`
	const headers = { 'Accept-Version': 'v1', Authorization }
	const base = 'https://api.unsplash.com/collections'
	const result: string[] = []

	for (let page = 1; page < 100; page++) {
		try {
			const path = `${base}/${collection}/photos?per_page=30&page=${page}`
			const resp = await fetch(path, { headers })
			const json = (await resp.json()) as UnsplashImage[]
			const ids = json.map((image) => image.id)

			result.push(...ids)
		} catch (error) {
			console.warn(error)
		}
	}

	return result
}
