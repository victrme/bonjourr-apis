export default async function unsplash(requrl: string, key: string, headers: HeadersInit): Promise<Response> {
	const endpoint = requrl.slice(requrl.indexOf('/unsplash') + 9)

	// Narrow endpoint to /photos/random
	if (!endpoint.startsWith('/photos/random?')) {
		return new Response('Forbidden', {
			status: 403,
			headers,
		})
	}

	const resp = await fetch(`https://api.unsplash.com${endpoint}`, {
		headers: {
			'Accept-Version': 'v1',
			Authorization: `Client-ID ${key}`,
		},
	})

	headers['content-type'] = 'application/json'

	let result: unknown[] = []

	try {
		result = await resp.json()
	} catch (error) {
		console.log(error)
	}

	return new Response(JSON.stringify(result), {
		status: resp.status,
		headers,
	})
}
