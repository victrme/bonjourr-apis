import { toBonjourrImages } from '../shared.ts'

import type { Image, UnsplashImage } from '../../../../../types/backgrounds.ts'
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

//  Get from storage

async function unsplashImagesDaylight(url: URL, env: Env, headers: Headers): Promise<Response> {
	const result: Record<string, Image[]> = {
		'bonjourr-images-daylight-night': [],
		'bonjourr-images-daylight-noon': [],
		'bonjourr-images-daylight-day': [],
		'bonjourr-images-daylight-evening': [],
	}

	const w = url.searchParams.get('w') ?? '1920'
	const h = url.searchParams.get('h') ?? '1080'

	for (const collection of Object.keys(result)) {
		const randomStatement = `SELECT data FROM "${collection}" ORDER BY RANDOM() LIMIT 10`
		const d1Result = await env.DB.prepare(randomStatement).all() as D1Result<Record<string, string>>

		if (d1Result.results.length === 0) {
			continue
		}

		const data = d1Result.results.map((row) => JSON.parse(row.data) as UnsplashImage)
		const images = toBonjourrImages(data, w, h)

		result[collection].push(...images)
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
			id TEXT PRIMARY KEY,
			data JSON NOT NULL
		);
	`

	await env.DB.prepare(createStatement).run()

	const ids = await retrievePhotosIdsFromCollection(id, env)
	const images = await retrievePhotosDataFromIds(ids, env)

	const promises = images.map(async (image) => {
		const id = image.id
		const data = JSON.stringify(image)
		const insertStatement = `INSERT INTO "${name}" (id, data) VALUES (?, ?)`
		await env.DB.prepare(insertStatement).bind(id, data).run()

		console.info(`Stored ${id} on ${name}`)
	})

	try {
		await Promise.all(promises)
	} catch (_) {
		// ...
	}
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
