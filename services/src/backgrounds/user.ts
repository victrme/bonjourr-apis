import type { Backgrounds } from '../types/backgrounds'
import type { Env } from '..'

export async function userTags(url: URL, env: Env, headers: Headers) {
	// ...
}

export async function userCollections(url: URL, env: Env, headers: Headers) {
	// ...
}

// UNSPLASH

async function unsplashTags(url: URL, env: Env, headers: Headers): Promise<Response> {
	const h = { 'Accept-Version': 'v1', Authorization: `Client-ID ${env.UNSPLASH}` }
	const u = `https://api.unsplash.com/photos/random/${url.search}`
	const resp = await fetch(u, { headers: h })
	const json = await resp.json()

	let arr: Backgrounds.API.UnsplashImage[] = []
	if (Array.isArray(json)) arr = json as Backgrounds.API.UnsplashImage[]
	if (!Array.isArray(json)) arr = [json as Backgrounds.API.UnsplashImage]

	const result: Backgrounds.Image[] = arr.map((item) => ({
		urls: {
			full: item.urls.raw,
			medium: item.urls.regular,
			small: item.urls.small,
		},
		page: item.links.html,
		download: item.links.download,
		username: item.user.username,
		name: item.user.name,
		city: item.location.city || undefined,
		country: item.location.country || undefined,
		color: item.color,
		exif: item.exif,
	}))

	return new Response(JSON.stringify(result), { headers })
}

// PIXABAY

async function pixabayTags(url: URL, env: Env, headers: Headers): Promise<void> {
	// ...
}
