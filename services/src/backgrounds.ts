import type { Backgrounds } from './types/backgrounds'

const headers = {
	'content-type': 'application/json',
	'cache-control': 'public, max-age=604800, immutable',
}

export default async function backgrounds(url: URL, env: any): Promise<Response> {
	//

	if (url.pathname.includes('/backgrounds/unsplash')) {
		return await unsplash(url, env.UNSPLASH)
	}

	if (url.pathname.includes('/backgrounds/pixabay')) {
		return await pixabay(url, env.PIXABAY)
	}

	return new Response('No valid provider', {
		status: 400,
	})
}

async function unsplash(url: URL, key = ''): Promise<Response> {
	const headers = { 'Accept-Version': 'v1', Authorization: `Client-ID ${key}` }
	const resp = await fetch(`https://api.unsplash.com/photos/random/${url.search}`, { headers })
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
		city: item.location.city,
		country: item.location.country,
		color: item.color,
		exif: item.exif,
	}))

	return new Response(JSON.stringify(result), { headers })
}

async function pixabay(url: URL, key = ''): Promise<Response> {
	const response = await fetch(`https://pixabay.com/api/videos/?key=${key}${url.search}`)
	const json = (await response.json()) as Backgrounds.API.PixabayVideos
	const video = json.hits[0]

	if (video === undefined) {
		throw new Error('Video could not be found with this search: ' + url.search)
	}

	const result: Backgrounds.Video[] = [
		{
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
		},
	]

	return new Response(JSON.stringify(result), { headers })
}

// async function pixabay(url: URL, key = '') {
// 	const search = url.search.replace('?', '&')
// 	const query = `https://pixabay.com/api/?key=${key}${search}`

// 	if (url.pathname.includes('videos')) {
// 		return await pixabayVideos(search, key)
// 	} else {
// 		return await fetch(query)
// 	}
// }
