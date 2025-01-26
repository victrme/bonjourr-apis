import { Env, UNSPLASH_COLLECTIONS } from '.'

export async function getUnsplash(url: URL, env: Env): Promise<Response> {
	const collection = url.pathname.replace('/get/unsplash/', '')
	let result: any = {}

	try {
		result = await env.UNSPLASH_KV.get(collection, 'json')
	} catch (e) {
		return new Response(e.message, { status: 500 })
	}

	return new Response(JSON.stringify(result), {
		headers: {
			'content-type': 'application/json',
		},
	})
}

export async function storeUnsplash(env: Env) {
	const promises = Object.entries(UNSPLASH_COLLECTIONS).map(([name, id]) =>
		storeUnsplashCollection(name, id, env)
	)

	await Promise.all(promises)

	return new Response('Done')
}

async function storeUnsplashCollection(name: string, id: string, env: Env): Promise<void> {
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
	const Authorization = 'Client-ID ' + env.UNSPLASH_KEY
	const headers = { 'Accept-Version': 'v1', Authorization }
	const path = `https://api.unsplash.com/collections/${collection}/photos?per_page=30&page=${page}`
	const resp = await fetch(path, { headers })
	const json = await resp.json()

	return json
}
