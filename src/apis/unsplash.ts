import type { UnsplashPhoto } from '../types/unsplash'

export default async function unsplash(requrl: string, key: string, headers: Headers): Promise<Response> {
	const endpoint = requrl.slice(requrl.indexOf('/unsplash') + 9)

	// Narrow endpoint to /photos/random
	if (!endpoint.startsWith('/photos/random')) {
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

	let result: UnsplashPhoto[] = []

	try {
		result = (await resp.json()) as UnsplashPhoto[]
	} catch (error) {
		console.log(error)
	}

	headers.set('Content-Type', 'application/json')
	headers.set('Cache-Control', 'no-cache')

	return new Response(JSON.stringify(result), {
		status: resp.status,
		headers,
	})
}
