import { Env } from '../..'

interface PixabayCollection {
	name: string
	ids: string[]
	type: 'film' | 'photo'
}

/*
 * PUBLIC
 */

export async function storePixabay(env: Env) {
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

/*
 * PRIVATE
 */

async function listCollections(env: Env): Promise<PixabayCollection[]> {
	const resp = await fetch(env.PIXABAY_COLLECTIONS ?? '')
	const collections = (await resp.json()) as PixabayCollection[]

	if (!collections || collections.length === 0) {
		throw new Error(`Collections have not been found.`)
	}

	return collections
}

async function getCollectionData(env: Env, collection: PixabayCollection) {
	const { ids, type } = collection
	const promises = ids.map((id) => getDataFromId(type, id, env.PIXABAY ?? ''))
	const data = await Promise.all(promises)

	return data
}

async function getDataFromId(type: 'film' | 'photo', id: string, key = ''): Promise<object> {
	const noParams = !id || !key

	if (noParams) {
		throw new Error('No parameters. Endpoint is "/images/id" or "/videos/id"')
	}

	const typepath = type === 'film' ? 'videos' : ''
	const resp = await fetch(`https://pixabay.com/api/${typepath}?key=${key}&id=${id}`)
	const json = await resp.json()

	if (json.hits.length === 1) {
		return json.hits[0]
	}

	throw new Error('Found nothing')
}
