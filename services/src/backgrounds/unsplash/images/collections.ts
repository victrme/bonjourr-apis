import type { Backgrounds } from "../../../types/backgrounds"
import type { Env } from "../../.."

export async function unsplashImagesCollections(url: URL, env: Env, headers: Headers): Promise<Response> {
	const query = url.searchParams.get("query")
	const apiurl = `https://api.unsplash.com/collections/${query}`
	const apiauth = `Client-ID ${env.UNSPLASH}`
	const apiheaders = { "accept-version": "v1", authorization: apiauth }
	const resp = await fetch(apiurl, { headers: apiheaders })
	const json = await resp.json()

	let arr: Backgrounds.API.UnsplashImage[] = []

	if (Array.isArray(json)) {
		arr = json as Backgrounds.API.UnsplashImage[]
	}
	if (!Array.isArray(json)) {
		arr = [json as Backgrounds.API.UnsplashImage]
	}

	const result: Backgrounds.Image[] = arr.map(item => ({
		format: "image",
		page: item.links.html,
		download: item.links.download,
		username: item.user.username,
		name: item.user.name,
		urls: {
			full: item.urls.raw,
			medium: item.urls.regular,
			small: item.urls.small,
		},
	}))

	return new Response(JSON.stringify({ "unsplash-images-user": result }), {
		headers,
	})
}
