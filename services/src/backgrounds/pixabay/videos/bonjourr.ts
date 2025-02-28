import { Backgrounds } from '../../../types/backgrounds'
import { Env } from '../../..'

interface PixabayCollection {
	name: string
	ids: string[]
	type: 'film'
}

export { pixabayVideosDaylight, pixabayVideosDaylightStore }

//	Get from storage

async function pixabayVideosDaylight(env: Env, headers: Headers): Promise<Response> {
	const result: Record<string, Backgrounds.Video[]> = {
		night: [],
		noon: [],
		day: [],
		evening: [],
	}

	for (const collection of ['night', 'noon', 'day', 'evening']) {
		const storage: Backgrounds.API.PixabayVideo[] = await env.PIXABAY_KV.get(collection, 'json')

		if (storage.length === 0) {
			throw new Error('Collection could not be found')
		}

		for (let i = 0; i < 10; i++) {
			const random = Math.floor(Math.random() * storage.length)
			const item = storage[random]

			result[collection].push({
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

async function pixabayVideosDaylightStore(env: Env) {
	const collectionList = await listCollections(env)

	for (const collection of collectionList) {
		try {
			const data = await getCollectionData(env, collection)
			await env.PIXABAY_KV.put(collection.name, JSON.stringify(data))
			console.log('Saved ', collection.name)
		} catch (e) {
			console.log(e.message)
		}
	}
}

async function listCollections(env: Env): Promise<PixabayCollection[]> {
	const resp = await fetch(env.PIXABAY_COLLECTIONS ?? '')
	const collections = (await resp.json()) as PixabayCollection[]

	if (!collections || collections.length === 0) {
		throw new Error(`Collections have not been found.`)
	}

	return collections
}

async function getCollectionData(env: Env, collection: PixabayCollection) {
	const { ids } = collection
	const promises = ids.map((id) => getDataFromId(id, env.PIXABAY ?? ''))
	const data = await Promise.all(promises)

	return data
}

async function getDataFromId(id: string, key = ''): Promise<object> {
	const noParams = !id || !key

	if (noParams) {
		throw new Error('No parameters. Endpoint is "/videos/id"')
	}

	const resp = await fetch(`https://pixabay.com/api/videos?key=${key}&id=${id}`)
	const json = await resp.json()

	if (json.hits.length === 1) {
		return json.hits[0]
	}

	throw new Error('Found nothing')
}
