import type { Backgrounds } from '../types/backgrounds'
import type { Env } from '..'

export async function bonjourrCollections(url: URL, env: Env, headers: Headers): Promise<Response> {
	if (url.pathname.includes('/backgrounds/bonjourr/unsplash')) {
		return await unsplashImages(url, env, headers)
	}

	if (url.pathname.includes('/backgrounds/bonjourr/pixabay/videos')) {
		return await pixabayVideos(url, env, headers)
	}

	if (url.pathname.includes('/backgrounds/bonjourr/pixabay/images')) {
		// return await pixabayImages(url, env, headers)
	}

	return new Response('No valid provider', {
		status: 400,
	})
}

export async function unsplashImages(url: URL, env: Env, headers: Headers): Promise<Response> {
	let collection = 'day'
	let result: Backgrounds.Image[] = []
	let storage: Backgrounds.API.UnsplashImage[] = []

	if (url.pathname.includes('night')) collection = 'night'
	if (url.pathname.includes('noon')) collection = 'noon'
	if (url.pathname.includes('evening')) collection = 'evening'

	storage = await env.UNSPLASH_KV.get(collection, 'json')

	for (let i = 0; i < 10; i++) {
		const random = Math.floor(Math.random() * storage.length)
		const item = storage[random]

		result.push({
			url: item.urls.raw,
			page: item.links.html,
			download: item.links.download,
			username: item.user.username,
			name: item.user.name,
			city: item.location.city || undefined,
			country: item.location.country || undefined,
			color: item.color,
			exif: item.exif,
		})
	}

	return new Response(JSON.stringify(result), { headers })
}

async function pixabayVideos(url: URL, env: Env, headers: Headers): Promise<Response> {
	let storage: Backgrounds.API.PixabayVideo[] = []
	let result: Backgrounds.Video[] = []

	storage = await env.PIXABAY_KV.get('videos', 'json')

	if (storage.length === 0) {
		throw new Error('Videos could not be found')
	}

	for (let i = 0; i < 10; i++) {
		const random = Math.floor(Math.random() * storage.length)
		const item = storage[random]

		result.push({
			page: item.pageURL,
			username: item.user,
			duration: item.duration,
			thumbnail: item.videos.large.thumbnail,
			urls: {
				large: item.videos.large.url,
				medium: item.videos.medium.url,
				small: item.videos.small.url,
				tiny: item.videos.tiny.url,
			},
		})
	}

	return new Response(JSON.stringify(result), { headers })
}

async function pixabayImages(url: URL, env: Env, headers: Headers): Promise<void> {
	// const result: Backgrounds.Image[] = []
	// const list = json as Backgrounds.API.PixabayImage[]
	// for (const image of list) {
	// 	result.push({
	// 		page: image.pageURL,
	// 		username: image.user,
	// 		url: image.largeImageURL,
	// 	})
	// }
	// return new Response(JSON.stringify(result), { headers })
}
