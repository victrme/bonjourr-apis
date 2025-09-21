import { resolutionBasedUrls } from '../shared.ts'

import type { PixabayVideo, Video } from '../../../../../types/backgrounds'
import type { Env } from '../../..'
import { getApiDataFromId } from '../../pixabay/shared.ts'

interface PixabayCollection {
	name: string
	ids: string[]
	type: 'film'
}

const ids = await retrievePhotosIdsFromCollection(id, env)
const images = await retrievePhotosDataFromIds(ids, env)

//	Save to storage

export async function pixabayVideosDaylightStore(env: Env) {
	const collectionList = await listCollections(env)

	try {
		for (const collection of collectionList) {
			const createStatement = `
			CREATE TABLE IF NOT EXISTS "${collection.name}" (
				url TEXT PRIMARY KEY,
				data JSON NOT NULL
			);`

			await env.DB.prepare(createStatement).run()
			const videos = await getApiCollectionData(env, collection)

			for (const video of videos) {
				const url = video.videos.large.url
				const data = JSON.stringify(video)
				const insertStatement = `INSERT INTO "${collection.name}" (url, data) VALUES (?, ?)`
				await env.DB.prepare(insertStatement).bind(url, data).run()
			}

			console.warn('Stored ', collection.name)
		}
	} catch (err) {
		console.warn(err)
	}
}

async function listCollections(env: Env): Promise<PixabayCollection[]> {
	const resp = await fetch(env.PIXABAY_COLLECTIONS ?? '')
	const collections = (await resp.json()) as PixabayCollection[]

	if (!collections || collections.length === 0) {
		throw new Error('Collections have not been found.')
	}

	return collections
}

async function getApiCollectionData(env: Env, collection: PixabayCollection): Promise<PixabayVideo[]> {
	const { ids } = collection
	const promises = ids.map((id) => getApiDataFromId(id, env.PIXABAY ?? ''))
	const data = await Promise.all(promises)
	return data
}
