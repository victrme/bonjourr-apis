import type { Backgrounds } from './types/backgrounds'

export default async function backgrounds(url: URL, env: any, headers: Headers): Promise<Response> {
	headers.set('content-type', 'application/json')
	headers.set('cache-control', 'public, max-age=604800, immutable')

	if (url.pathname.includes('/backgrounds/unsplash')) {
		return await unsplash(url, env.UNSPLASH, headers)
	}

	if (url.pathname.includes('/backgrounds/pixabay')) {
		return await pixabay(url, env.PIXABAY, headers)
	}

	return new Response('No valid provider', {
		status: 400,
	})
}

async function unsplash(url: URL, key = '', headers: Headers): Promise<Response> {
	const h = { 'Accept-Version': 'v1', Authorization: `Client-ID ${key}` }
	const u = `https://api.unsplash.com/photos/random/${url.search}`
	const resp = await fetch(u, { headers: h })
	const json = await resp.json()

	let arr: Backgrounds.API.UnsplashImage[] = []
	if (Array.isArray(json)) arr = json as Backgrounds.API.UnsplashImage[]
	if (!Array.isArray(json)) arr = [json as Backgrounds.API.UnsplashImage]

	const result: Backgrounds.Image[] = arr.map((item) => ({
		url: item.urls.raw,
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

async function pixabay(url: URL, _key = '', headers: Headers): Promise<Response> {
	const response = await fetch(`https://collections.bonjourr.fr/get/pixabay?collection=videos`)
	const json = await response.json()

	if (json.length === 0) {
		throw new Error('Video could not be found with this search: ' + url.search)
	}

	if (json[0].type === 'film') {
		const result: Backgrounds.Video[] = []
		const list = json as Backgrounds.API.PixabayVideo[]

		for (const video of list) {
			result.push({
				page: video.pageURL,
				username: video.user,
				duration: video.duration,
				thumbnail: video.videos.large.thumbnail,
				urls: {
					large: video.videos.large.url,
					medium: video.videos.medium.url,
					small: video.videos.small.url,
					tiny: video.videos.tiny.url,
				},
			})
		}

		return new Response(JSON.stringify(result), { headers })
	}

	if (json[0].type === 'photo') {
		const result: Backgrounds.Image[] = []
		const list = json as Backgrounds.API.PixabayImage[]

		for (const image of list) {
			result.push({
				page: image.pageURL,
				username: image.user,
				url: image.largeImageURL,
			})
		}

		return new Response(JSON.stringify(result), { headers })
	}

	throw new Error('Hits are neither photo or film')
}
