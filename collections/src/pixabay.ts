import type { Env, PixabayCollection } from '.'

export async function getPixabay(url: URL, env: Env): Promise<Response> {
	const collection = url.pathname.replace('/get/pixabay/', '')
	let result: any = {}

	try {
		result = await env.PIXABAY_KV.get(collection, 'json')
	} catch (e) {
		return new Response(e.message, { status: 500 })
	}

	return new Response(JSON.stringify(result), {
		headers: {
			'content-type': 'application/json',
		},
	})
}

export async function storePixabay(env: Env): Promise<Response> {
	const key = env.PIXABAY_KEY ?? ''

	// 1. Get ids in specified collection

	const resp = await fetch(env.PIXABAY_COLLECTIONS ?? '')
	const collections = (await resp.json()) as PixabayCollection[]

	if (!collections || collections.length === 0) {
		throw new Error(`Collections have not been found.`)
	}

	// 2. Get image info from Pixabay servers
	// 3. Save info to our storage

	for (const { name, ids, type } of collections) {
		try {
			const data = ids.map(async (id) => await getInfoFromId(type, id, key))
			await env.PIXABAY_KV.put(name, JSON.stringify(data))
		} catch (e) {
			console.log(e.message)
		}
	}

	return new Response('Done')
}

/** This gets info from pixabay for a single id */
async function getInfoFromId(type: 'film' | 'photo', id: string, key: string): Promise<unknown[]> {
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

	return []
}
