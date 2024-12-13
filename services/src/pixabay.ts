import type { PixabayVideos } from './types/pixabay'

interface VideoInfo {
	duration: number
	thumbnail: string
	urls: {
		large: string
		medium: string
		small: string
		tiny: string
	}
	credit: {
		page: string
		name: string
		id: number
	}
}

export default async function pixabay(url: URL, key = '') {
	const search = url.search.replace('?', '&')
	const query = `https://pixabay.com/api/?key=${key}${search}`

	if (url.pathname.includes('videos')) {
		return await pixabayVideos(search, key)
	} else {
		return await fetch(query)
	}
}

async function pixabayVideos(search: string, key = '') {
	const response = await fetch(`https://pixabay.com/api/videos/?key=${key}${search}`)

	if (response.status !== 200) {
		throw new Error('Something happened')
	}

	const json = (await response.json()) as PixabayVideos
	const video = json.hits[0]

	if (video === undefined) {
		throw new Error('Video could not be found with this search: ' + search)
	}

	const result: VideoInfo = {
		duration: video.duration,
		thumbnail: video.videos.large.thumbnail,
		urls: {
			large: video.videos.large.url,
			medium: video.videos.medium.url,
			small: video.videos.small.url,
			tiny: video.videos.tiny.url,
		},
		credit: {
			page: video.pageURL,
			name: video.user,
			id: video.user_id,
		},
	}

	return new Response(JSON.stringify(result), {
		headers: {
			'content-type': 'application/json',
			'cache-control': 'public, max-age=604800, immutable',
		},
	})
}
