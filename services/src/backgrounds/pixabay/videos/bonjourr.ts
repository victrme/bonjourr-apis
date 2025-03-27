import type { Video, PixabayVideo } from '../../../../../types/backgrounds'
import type { Env } from '../../..'

interface PixabayCollection {
	name: string
	ids: string[]
	type: 'film'
}

//	Get from storage

export async function pixabayVideosDaylight(env: Env, headers: Headers): Promise<Response> {
	const result: Record<string, Video[]> = {
		'bonjourr-videos-daylight-night': [],
		'bonjourr-videos-daylight-noon': [],
		'bonjourr-videos-daylight-day': [],
		'bonjourr-videos-daylight-evening': [],
	}

	for (const collection of Object.keys(result)) {
		const randomStatement = `SELECT data FROM "${collection}" ORDER BY RANDOM() LIMIT 10`
		const { results } = await env.DB.prepare(randomStatement).all()

		if (results.length === 0) {
			throw new Error('Collection could not be found')
		}

		for (const row of results) {
			const data = row.data as string
			const item: PixabayVideo = JSON.parse(data)

			result[collection].push({
				format: 'video',
				page: item.pageURL,
				username: item.user,
				duration: item.duration,
				thumbnail: item.videos.large.thumbnail,
				urls: {
					full: item.videos.large.url,
					medium: item.videos.medium.url,
					small: item.videos.tiny.url,
				},
			})
		}
	}

	return new Response(JSON.stringify(result), { headers })
}

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
	} catch (e) {
		console.warn(e.message)
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
	const promises = ids.map(id => getApiDataFromId(id, env.PIXABAY ?? ''))
	const data = await Promise.all(promises)

	return data
}

async function getApiDataFromId(id: string, key = ''): Promise<PixabayVideo> {
	const noParams = !(id && key)

	if (noParams) {
		throw new Error('No parameters. Endpoint is "/videos/id"')
	}

	const resp = await fetch(`https://pixabay.com/api/videos?key=${key}&id=${id}`)
	const json = await resp.json()

	if (json.hits.length === 1) {
		return json.hits[0] as PixabayVideo
	}

	throw new Error('Found nothing')
}
