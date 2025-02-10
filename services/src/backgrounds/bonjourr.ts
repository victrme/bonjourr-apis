import type { Backgrounds } from '../types/backgrounds'
import type { Env } from '..'

export async function daylightCollections(url: URL, env: Env, headers: Headers): Promise<Response> {
	headers.set('Content-Type', 'application/json')
	headers.set('Cache-Control', 'public, max-age=10')

	if (url.pathname.includes('/backgrounds/daylight/images/unsplash')) {
		return await unsplashImages(env, headers)
	}

	if (url.pathname.includes('/backgrounds/daylight/videos/pixabay')) {
		return await pixabayVideos(env, headers)
	}

	// if (url.pathname.includes('/backgrounds/daylight/images/pixabay')) {
	// 	return await pixabayImages(env, headers)
	// }

	return new Response('No valid provider', {
		status: 400,
	})
}

export async function unsplashImages(env: Env, headers: Headers): Promise<Response> {
	const result: Record<string, Backgrounds.Image[]> = {
		night: [],
		noon: [],
		day: [],
		evening: [],
	}

	for (const collection of ['night', 'noon', 'day', 'evening']) {
		const storage: Backgrounds.API.UnsplashImage[] = await env.UNSPLASH_KV.get(
			collection,
			'json'
		)

		for (let i = 0; i < 10; i++) {
			const random = Math.floor(Math.random() * storage.length)
			const item = storage[random]

			result[collection].push({
				url: item.urls.raw,
				page: item.links.html,
				download: item.links.download,
				username: item.user.username,
				name: item.user.name,
				city: item?.location?.city || undefined,
				country: item?.location?.country || undefined,
				color: item.color,
				exif: item.exif,
			})
		}
	}

	return new Response(JSON.stringify(result), { headers })
}

async function pixabayVideos(env: Env, headers: Headers): Promise<Response> {
	const result: Record<string, Backgrounds.Video[]> = {
		night: [],
		noon: [],
		day: [],
		evening: [],
	}

	for (const collection of ['night', 'noon', 'day', 'evening']) {
		const storage: Backgrounds.API.PixabayVideo[] = await env.PIXABAY_KV.get(collection, 'json')

		if (storage.length === 0) {
			throw new Error('Collection could not be found')
		}

		for (let i = 0; i < 10; i++) {
			const random = Math.floor(Math.random() * storage.length)
			const item = storage[random]

			result[collection].push({
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
	}

	return new Response(JSON.stringify(result), { headers })
}

async function pixabayImages(env: Env, headers: Headers): Promise<Response> {
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

	return new Response('pixabay images', { headers })
}
