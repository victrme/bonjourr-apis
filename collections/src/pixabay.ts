//
const COLLEC_IDS_PATH =
	'https://cdn.jsdelivr.net/gh/victrme/bonjourr-apis@refs/heads/backgrounds/assets/pixabay_collections.json'

export async function getPixabay(url: URL, env: any): Promise<Response> {
	const collection = url.searchParams.get('collection') ?? ''
	let result: any = {}

	try {
		result = await env.PIXABAY_KV.get(collection)
	} catch (e) {
		return new Response(e.message, { status: 500 })
	}

	return new Response(JSON.stringify(result), {
		headers: {
			'content-type': 'application/json',
		},
	})
}

export async function storePixabay(url: URL, env: any): Promise<Response> {
	const collection = url.searchParams.get('collection') ?? ''
	const type = url.searchParams.get('type') ?? ''
	const key = env.PIXABAY_KEY ?? ''

	// 1. Get ids in specified collection

	const resp = await fetch(COLLEC_IDS_PATH)
	const json = (await resp.json()) as Record<string, string[]>
	const ids = json[collection]

	if (ids === undefined) {
		throw new Error(`Collection "${collection}" has not been found.`)
	}

	// 2. Get image info from Pixabay servers

	const result: unknown[] = []

	for (const id of ids) {
		try {
			result.push(await getInfoFromId(type, id, key))
		} catch (e) {
			console.log(e.message)
		}
	}

	// 3. Save info to our storage

	try {
		await env.PIXABAY_KV.put(collection, JSON.stringify(result))
	} catch (e) {
		return new Response(e.message, {
			status: 500,
		})
	}

	return new Response('Successful write', {
		status: 201,
	})
}

/** This gets info from pixabay for a single id */
async function getInfoFromId(type: string, id: string, key: string): Promise<unknown[]> {
	const noParams = !id || !key
	const wrongType = type !== 'videos' && type !== 'images'

	if (noParams) {
		throw new Error('No parameters. Endpoint is "/images/id" or "/videos/id"')
	}

	if (wrongType) {
		throw new Error('Media type should be either "images" or "videos"')
	}

	const typepath = type === 'videos' ? 'videos' : ''
	const resp = await fetch(`https://pixabay.com/api/${typepath}?key=${key}&id=${id}`)
	const json = await resp.json()

	if (json.hits.length === 1) {
		return json.hits[0]
	}

	return []
}
