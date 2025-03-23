import type { UnsplashPhoto } from "../../types/unsplash"

export async function unsplash(requrl: string, key: string, headers: Headers): Promise<Response> {
	const endpoint = requrl.slice(requrl.indexOf("/unsplash") + 9)

	// Narrow endpoint to /photos
	if (!endpoint.startsWith("/photos")) {
		return new Response("Forbidden", {
			status: 403,
			headers,
		})
	}

	const resp = await fetch(`https://api.unsplash.com${endpoint}`, {
		headers: {
			"accept-version": "v1",
			authorization: `Client-ID ${key}`,
		},
	})

	let result: UnsplashPhoto[] = []

	try {
		result = (await resp.json()) as UnsplashPhoto[]
	} catch (error) {
		console.warn(error)
	}

	headers.set("Content-Type", "application/json")
	headers.set("Cache-Control", "no-cache")

	return new Response(JSON.stringify(result), {
		status: resp.status,
		headers,
	})
}
