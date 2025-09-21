import type { Pixabay, PixabayVideo } from '../../../types/backgrounds.ts'

export function resolutionBasedUrls(video: PixabayVideo) {
	const { large, medium, small, tiny } = video.videos
	const heights = Object.values(video.videos).map(({ height }) => height)

	if (heights.includes(2160)) {
		return {
			large: small.url, // 1080
			medium: small.url, // 1080
			small: tiny.url, // 720
		}
	}

	if (heights.includes(1440)) {
		return {
			large: medium.url, // 1080
			medium: small.url, // 720
			small: tiny.url, // 540
		}
	}

	return {
		large: large.url, // 1080
		medium: medium.url, // 720
		small: small.url, // 540
	}
}

export async function getApiDataFromId(id: string, key = ''): Promise<PixabayVideo> {
	const noParams = !(id && key)

	if (noParams) {
		throw new Error('No parameters. Endpoint is "/videos/id"')
	}

	const resp = await fetch(`https://pixabay.com/api/videos?key=${key}&id=${id}`)
	const json = await resp.json<Pixabay>()

	if (json.hits.length === 1) {
		return json.hits[0] as PixabayVideo
	}

	throw new Error('Found nothing')
}
